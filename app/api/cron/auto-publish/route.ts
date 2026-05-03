// app/api/cron/auto-publish/route.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type Section = 'blog' | 'qa' | 'cases';

export async function GET(request: Request) {
  try {
    // 验证 token
    const cronSecret = process.env.CRON_SECRET;
    const url = new URL(request.url);
    const urlToken = url.searchParams.get('token');
    
    if (!cronSecret || urlToken !== cronSecret) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    // 获取当前时间（UTC+8）
    const now = new Date();
    const utc8Offset = 8 * 60 * 60 * 1000;
    const nowUtc8 = new Date(now.getTime() + utc8Offset);
    const today = new Date(nowUtc8.toDateString());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 查询发布设置
    const publishSettings = await prisma.publishSettings.findMany();
    
    const settingsMap: Record<string, any> = {};
    publishSettings.forEach(setting => {
      settingsMap[setting.section] = setting;
    });

    // 默认设置
    const defaultSettings = {
      blog: { strategy: 'manual', dailyLimit: 1, randomEnabled: false, scheduleEnabled: false },
      qa: { strategy: 'manual', dailyLimit: 1, randomEnabled: false, scheduleEnabled: false },
      cases: { strategy: 'manual', dailyLimit: 1, randomEnabled: false, scheduleEnabled: false }
    };

    const results = [];

    // 处理每个板块
    for (const section of ['blog', 'qa', 'cases'] as Section[]) {
      const settings = { ...defaultSettings[section], ...settingsMap[section] };
      let publishedCount = 0;
      let remainingPending = 0;
      let message = '';

      try {
        // 查询今日已发布数量
        const todayPublished = await prisma[section].count({
          where: {
            status: 'published',
            publishedAt: { gte: today, lt: tomorrow }
          }
        });

        // 检查每日限额
        if (todayPublished >= settings.dailyLimit) {
          message = `已达到每日发布上限(${settings.dailyLimit}篇)`;
          results.push({ section, published: 0, remainingPending: 0, message });
          continue;
        }

        // 查询待发布文章
        const pendingItems = await prisma[section].findMany({
          where: {
            status: 'pending',
            OR: [{ publishAt: null }, { publishAt: { lte: nowUtc8 } }]
          },
          orderBy: { createdAt: 'asc' }
        });

        remainingPending = pendingItems.length;

        if (pendingItems.length === 0) {
          message = '无待发布内容';
          results.push({ section, published: 0, remainingPending, message });
          continue;
        }

        // 检查是否启用随机发布
        if (!settings.randomEnabled) {
          message = '随机发布未启用';
          results.push({ section, published: 0, remainingPending, message });
          continue;
        }

        // 检查今日是否已随机发布过
        const todayLog = await prisma.randomPublishLog.findFirst({
          where: { section, date: { gte: today, lt: tomorrow } }
        });

        if (todayLog) {
          message = `今日已随机发布 ${todayLog.publishedCount} 篇`;
          results.push({ section, published: 0, remainingPending, message });
          continue;
        }

        // 执行随机发布
        const remaining = settings.dailyLimit - todayPublished;
        const shuffled = [...pendingItems].sort(() => Math.random() - 0.5);
        const toPublish = shuffled.slice(0, Math.min(remaining, pendingItems.length));

        if (toPublish.length > 0) {
          // 更新文章状态
          await prisma[section].updateMany({
            where: { id: { in: toPublish.map(item => item.id) } },
            data: { status: 'published', publishedAt: nowUtc8 }
          });

          // 记录发布日志
          await prisma.randomPublishLog.create({
            data: { section, date: today, publishedCount: toPublish.length }
          });

          publishedCount = toPublish.length;
          remainingPending -= publishedCount;
          message = `随机发布成功，发布 ${publishedCount} 篇`;
        }

      } catch (error) {
        message = `发布失败: ${error instanceof Error ? error.message : '未知错误'}`;
      }

      results.push({ section, published: publishedCount, remainingPending, message });
    }

    await prisma.$disconnect();
    return new Response(JSON.stringify({ success: true, results, timestamp: nowUtc8.toISOString() }), { status: 200 });
    
  } catch (error) {
    await prisma.$disconnect();
    return new Response(JSON.stringify({ 
      error: '自动发布失败', 
      details: error instanceof Error ? error.message : '未知错误' 
    }), { status: 500 });
  }
}