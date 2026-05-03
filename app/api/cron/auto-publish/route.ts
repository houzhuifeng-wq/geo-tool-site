// app/api/cron/auto-publish/route.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type Section = 'blog' | 'qa' | 'cases';

// AI 生成文章函数
async function generateArticle(section: Section): Promise<{ title: string; content: string; category: string } | null> {
  try {
    // 模拟 AI 生成文章
    const titles: Record<Section, string[]> = {
      blog: ['如何学习编程', '人工智能入门指南', '前端开发最佳实践'],
      qa: ['什么是 JavaScript？', '如何使用 React？', 'CSS 动画教程'],
      cases: ['企业数字化转型案例', '电商平台解决方案', '云计算应用案例']
    };
    
    const contents: Record<Section, string[]> = {
      blog: ['这是一篇关于编程学习的文章...', '人工智能正在改变世界...', '前端开发需要掌握的技能...'],
      qa: ['JavaScript 是一种脚本语言...', 'React 是一个用于构建用户界面的库...', 'CSS 动画可以让网页更加生动...'],
      cases: ['某企业成功实现数字化转型...', '电商平台架构设计方案...', '云计算为企业带来的优势...']
    };
    
    const categories: Record<Section, string[]> = {
      blog: ['技术分享', '学习心得', '行业动态'],
      qa: ['技术问答', '入门教程', '常见问题'],
      cases: ['企业方案', '成功案例', '行业分析']
    };
    
    const title = titles[section][Math.floor(Math.random() * titles[section].length)];
    const content = contents[section][Math.floor(Math.random() * contents[section].length)];
    const category = categories[section][Math.floor(Math.random() * categories[section].length)];
    
    return { title, content, category };
  } catch (error) {
    console.error('AI 生成文章失败:', error);
    return null;
  }
}

// 查重检查函数
async function checkDuplicate(section: Section, title: string): Promise<boolean> {
  try {
    const count = await prisma[section].count({
      where: { title: { contains: title, mode: 'insensitive' } }
    });
    return count > 0;
  } catch (error) {
    console.error('查重检查失败:', error);
    return false;
  }
}

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
      let pendingCount = 0;
      let message = '';

      try {
        // 检查是否启用自动发布
        if (!settings.randomEnabled && !settings.scheduleEnabled) {
          message = '自动发布未启用';
          results.push({ section, published: 0, pending: 0, message });
          continue;
        }

        // 检查每日限额
        const todayPublished = await prisma[section].count({
          where: {
            status: 'published',
            publishedAt: { gte: today, lt: tomorrow }
          }
        });

        if (todayPublished >= settings.dailyLimit) {
          message = `已达到每日发布上限(${settings.dailyLimit}篇)`;
          results.push({ section, published: 0, pending: 0, message });
          continue;
        }

        // 检查今日是否已生成过
        const todayLog = await prisma.randomPublishLog.findFirst({
          where: { section, date: { gte: today, lt: tomorrow } }
        });

        if (todayLog) {
          message = `今日已自动生成 ${todayLog.publishedCount} 篇`;
          results.push({ section, published: 0, pending: 0, message });
          continue;
        }

        // AI 生成文章
        const article = await generateArticle(section);
        if (!article) {
          message = 'AI 生成文章失败';
          results.push({ section, published: 0, pending: 0, message });
          continue;
        }

        // 查重检查
        const isDuplicate = await checkDuplicate(section, article.title);

        // 决定发布方式
        if (isDuplicate) {
          // 查重失败，放入待审核
          await prisma[section].create({
            data: {
              title: article.title,
              content: article.content,
              category: article.category,
              status: 'pending',
              similarTitles: article.title,
              createdAt: nowUtc8,
              updatedAt: nowUtc8
            }
          });
          pendingCount = 1;
          message = '查重失败，文章已放入待审核';
        } else {
          // 查重通过，直接发布
          await prisma[section].create({
            data: {
              title: article.title,
              content: article.content,
              category: article.category,
              status: 'published',
              publishedAt: nowUtc8,
              createdAt: nowUtc8,
              updatedAt: nowUtc8
            }
          });
          publishedCount = 1;
          message = 'AI 生成并发布成功';
        }

        // 记录日志
        await prisma.randomPublishLog.create({
          data: { section, date: today, publishedCount: publishedCount }
        });

      } catch (error) {
        message = `自动发布失败: ${error instanceof Error ? error.message : '未知错误'}`;
      }

      results.push({ section, published: publishedCount, pending: pendingCount, message });
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