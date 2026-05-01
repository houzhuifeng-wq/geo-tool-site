import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 板块类型
type Section = 'blog' | 'qa' | 'cases';

// Prisma 模型名称映射（Prisma 会将模型名转为复数）
const sectionToModel: Record<Section, string> = {
  blog: 'blogs',
  qa: 'qas',
  cases: 'cases'
};

// 发布设置类型
interface PublishSettings {
  section: Section;
  scheduleEnabled: boolean;
  scheduleTime: string; // HH:MM 格式
  randomEnabled: boolean;
  dailyLimit: number;
  randomTargetTime?: string; // HH:MM 格式
  randomTargetDate?: Date;
}

// 发布结果类型
interface PublishResult {
  section: Section;
  published: number;
  remainingPending: number;
  message: string;
}

// 生成随机时间（HH:MM格式）
function getRandomTimeThisMinute(): string {
  const hours = Math.floor(Math.random() * 24).toString().padStart(2, '0');
  const minutes = Math.floor(Math.random() * 60).toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

export async function GET(request: Request) {
  // ========== 安全验证 ==========
  const cronSecret = process.env.CRON_SECRET;
  
  if (!cronSecret) {
    console.error('CRON_SECRET 环境变量未设置');
    return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500 });
  }

  // 支持两种验证方式：
  // 1. Authorization: Bearer <secret>
  // 2. URL 参数 ?token=<secret>
  
  const authHeader = request.headers.get('Authorization');
  const url = new URL(request.url);
  const urlToken = url.searchParams.get('token');
  
  let isValid = false;
  
  // 检查 Authorization 头
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const bearerToken = authHeader.substring(7);
    isValid = bearerToken === cronSecret;
  }
  
  // 检查 URL token 参数
  if (!isValid && urlToken) {
    isValid = urlToken === cronSecret;
  }
  
  if (!isValid) {
    console.warn('未授权的自动发布请求');
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  // ========== 验证结束 ==========

  try {
    // 获取当前时间（中国时区 UTC+8）
    const now = new Date();
    const utc8Offset = 8 * 60 * 60 * 1000;
    const nowUtc8 = new Date(now.getTime() + utc8Offset);
    const today = new Date(nowUtc8.toDateString());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 读取所有板块的发布设置
    const publishSettings = await prisma.publishSettings.findMany();
    
    // 定义默认设置
    const defaultSettings: Record<Section, PublishSettings> = {
      blog: { section: 'blog', scheduleEnabled: false, scheduleTime: '08:00', randomEnabled: false, dailyLimit: 1 },
      qa: { section: 'qa', scheduleEnabled: false, scheduleTime: '08:00', randomEnabled: false, dailyLimit: 1 },
      cases: { section: 'cases', scheduleEnabled: false, scheduleTime: '08:00', randomEnabled: false, dailyLimit: 1 }
    };
    
    // 合并数据库中的设置
    publishSettings.forEach((setting: any) => {
      if (setting.section && defaultSettings[setting.section as Section]) {
        defaultSettings[setting.section as Section] = {
          ...defaultSettings[setting.section as Section],
          scheduleEnabled: setting.scheduleEnabled || false,
          scheduleTime: setting.scheduleTime || '08:00',
          randomEnabled: setting.randomEnabled || false,
          dailyLimit: setting.dailyLimit || 1,
          randomTargetTime: setting.randomTargetTime,
          randomTargetDate: setting.randomTargetDate ? new Date(setting.randomTargetDate) : undefined
        };
      }
    });

    // ========== 支持 ?section 参数 ==========
    const sectionParam = url.searchParams.get('section') as Section | null;
    const sectionsToProcess: Section[] = sectionParam 
      ? [sectionParam] 
      : (Object.keys(defaultSettings) as Section[]);
    // ========== section 参数处理结束 ==========

    const results: PublishResult[] = [];

    // 对指定板块进行处理
    for (const section of sectionsToProcess) {
      const settings = defaultSettings[section];
      let publishedCount = 0;
      let remainingPending = 0;
      let message = '';

      // 统计今天已经自动发布的数量
      const modelName = sectionToModel[section];
      const todayPublishedCount = await (prisma[modelName as keyof typeof prisma] as any).count({
        where: {
          status: 'published',
          publishedAt: {
            gte: today,
            lt: tomorrow
          }
        }
      });

      // 计算剩余可发布数
      const remaining = settings.dailyLimit - (todayPublishedCount || 0);
      if (remaining <= 0) {
        message = `已达到每日发布限制（${settings.dailyLimit}篇）`;
        results.push({ section, published: 0, remainingPending: 0, message });
        continue;
      }

      // 查询待发布列表
      const pendingItems = await (prisma[modelName as keyof typeof prisma] as any).findMany({
        where: {
          status: 'pending',
          OR: [
            { publishAt: null },
            { publishAt: { lte: nowUtc8 } }
          ]
        },
        orderBy: { createdAt: 'asc' }
      });

      remainingPending = pendingItems.length;

      if (pendingItems.length === 0) {
        message = '无待发布内容';
        results.push({ section, published: 0, remainingPending, message });
        continue;
      }

      // 检查是否需要定时发布
      const currentTimeStr = nowUtc8.toTimeString().substring(0, 5); // HH:MM 格式
      let isScheduledPublish = false;

      if (settings.scheduleEnabled && currentTimeStr >= settings.scheduleTime) {
        // 执行定时发布
        isScheduledPublish = true;
        const publishItems = pendingItems.slice(0, remaining);
        const itemIds = publishItems.map((item: any) => item.id);

        if (itemIds.length > 0) {
          await (prisma[modelName as keyof typeof prisma] as any).updateMany({
            where: { id: { in: itemIds } },
            data: { status: 'published', publishedAt: nowUtc8 }
          });

          publishedCount = itemIds.length;
          remainingPending = pendingItems.length - publishedCount;
          message = `定时发布 ${publishedCount} 篇`;
        }
      }

      // 如果定时发布未触发，检查是否需要随机发布
      if (!isScheduledPublish && settings.randomEnabled) {
        // 检查今天是否已经随机发布过
        const todayRandomLog = await prisma.randomPublishLog.findUnique({
          where: { section_date: { section, date: today } }
        });

        if (!todayRandomLog) {
          // 检查是否需要生成今天的随机目标时间
          let randomTargetTime = settings.randomTargetTime;
          let randomTargetDate = settings.randomTargetDate;

          // 如果没有随机目标时间，或者目标时间不是今天，则生成新的
          if (!randomTargetTime || !randomTargetDate || randomTargetDate.toDateString() !== today.toDateString()) {
            randomTargetTime = getRandomTimeThisMinute();
            randomTargetDate = today;

            // 更新数据库中的随机目标时间
            await prisma.publishSettings.update({
              where: { section },
              data: { randomTargetTime, randomTargetDate }
            });
          }

          // 检查当前时间是否达到随机目标时间
          if (currentTimeStr >= randomTargetTime) {
            // 执行随机发布
            const shuffledItems = [...pendingItems].sort(() => Math.random() - 0.5);
            const publishItems = shuffledItems.slice(0, remaining);
            const itemIds = publishItems.map(item => item.id);

            if (itemIds.length > 0) {
              // 更新文章状态
              await (prisma[modelName as keyof typeof prisma] as any).updateMany({
                where: { id: { in: itemIds } },
                data: { status: 'published', publishedAt: nowUtc8 }
              });

              // 记录随机发布日志
              await prisma.randomPublishLog.create({
                data: { section, date: today, publishedCount: itemIds.length }
              });

              publishedCount = itemIds.length;
              remainingPending = pendingItems.length - publishedCount;
              message = `随机发布 ${publishedCount} 篇`;
            }
          } else {
            message = `随机发布未到时间（目标时间：${randomTargetTime}）`;
          }
        } else {
          message = '今天已经随机发布过';
        }
      }

      results.push({ section, published: publishedCount, remainingPending, message });
    }

    await prisma.$disconnect();

    return new Response(JSON.stringify({
      success: true,
      results,
      timestamp: nowUtc8.toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('自动发布失败:', error);
    return new Response(JSON.stringify({ error: '自动发布失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}