// app/api/cron/auto-publish/route.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
type Section = 'blog' | 'qa' | 'cases';

// 延迟函数，用于控制发布间隔
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function GET(request: Request) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    const url = new URL(request.url);
    const urlToken = url.searchParams.get('token');
    const sectionParam = url.searchParams.get('section') as Section | null;
    
    // 验证安全令牌
    if (!cronSecret || urlToken !== cronSecret) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const now = new Date();
    const utc8Offset = 8 * 60 * 60 * 1000;
    const nowUtc8 = new Date(now.getTime() + utc8Offset);

    const results = [];
    // 根据参数决定处理哪些板块
    const sections: Section[] = sectionParam ? [sectionParam] : ['blog', 'qa', 'cases'];

    // 串行处理所有板块，避免并发问题
    for (const section of sections) {
      const result = await processSection(section);
      results.push(result);
      
      // 每个板块之间间隔2秒，避免请求过于频繁
      await delay(2000);
    }

    await prisma.$disconnect();
    return new Response(JSON.stringify({ success: true, results, timestamp: nowUtc8.toISOString() }), { status: 200 });
    
  } catch (error) {
    await prisma.$disconnect();
    return new Response(JSON.stringify({ 
      error: 'Auto publish failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }), { status: 500 });
  }
}

// 处理单个板块的随机发布
async function processSection(section: Section) {
  let publishedCount = 0;
  let pendingCount = 0;
  let message = '';

  try {
    // 使用安全的 Prisma 查询获取发布设置
    const settings = await prisma.publishSettings.findUnique({
      where: { section }
    });
    
    if (!settings) {
      message = 'No settings found';
      return { section, published: publishedCount, pending: pendingCount, message };
    }

    const dailyLimit = settings.dailyLimit || 1;
    const randomEnabled = settings.randomEnabled || false;
    const scheduleEnabled = settings.scheduleEnabled || false;

    if (!randomEnabled && !scheduleEnabled) {
      message = 'Auto publish not enabled';
      return { section, published: publishedCount, pending: pendingCount, message };
    }

    // 统计今天已发布的数量
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayPublished = await prisma[section].count({
      where: {
        status: 'published',
        publishedAt: {
          gte: today
        }
      }
    });

    // 如果今天已经发布了足够的数量，跳过
    if (todayPublished >= dailyLimit) {
      message = `Daily limit reached (${todayPublished}/${dailyLimit})`;
      return { section, published: todayPublished, pending: 0, message };
    }

    // 获取待发布的文章
    const pendingArticles = await prisma[section].findMany({
      where: { status: 'pending' },
      orderBy: { createdAt: 'asc' },
      take: dailyLimit - todayPublished
    });

    pendingCount = pendingArticles.length;

    if (pendingCount === 0) {
      message = 'No pending articles';
      return { section, published: todayPublished, pending: pendingCount, message };
    }

    // 逐个发布文章，添加随机延迟
    for (let i = 0; i < pendingArticles.length; i++) {
      const article = pendingArticles[i];
      
      // 生成随机发布时间（工作时间内：9:00-18:00）
      const workStart = 9;
      const workEnd = 18;
      const randomHour = workStart + Math.floor(Math.random() * (workEnd - workStart));
      const randomMinute = Math.floor(Math.random() * 60);
      
      const publishTime = new Date();
      publishTime.setHours(randomHour, randomMinute, 0, 0);

      // 更新文章状态为已发布
      await prisma[section].update({
        where: { id: article.id },
        data: {
          status: 'published',
          publishedAt: publishTime
        }
      });

      publishedCount++;
      
      // 每篇文章之间间隔1秒
      if (i < pendingArticles.length - 1) {
        await delay(1000);
      }
    }

    message = `Published ${publishedCount} articles successfully`;

  } catch (error) {
    message = `Failed: ${error instanceof Error ? error.message.substring(0, 80) : 'Unknown'}`;
  }

  return { section, published: publishedCount, pending: pendingCount, message };
}