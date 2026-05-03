// app/api/cron/auto-publish/route.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type Section = 'blog' | 'qa' | 'cases';

// AI generate article function
async function generateArticle(section: Section): Promise<{ title: string; content: string; category: string } | null> {
  try {
    const titles: Record<Section, string[]> = {
      blog: ['How to learn programming', 'AI introduction guide', 'Frontend development best practices'],
      qa: ['What is JavaScript?', 'How to use React?', 'CSS animation tutorial'],
      cases: ['Enterprise digital transformation', 'E-commerce platform solution', 'Cloud computing case']
    };
    
    const contents: Record<Section, string[]> = {
      blog: ['This is an article about programming...', 'AI is changing the world...', 'Frontend development skills...'],
      qa: ['JavaScript is a scripting language...', 'React is a UI library...', 'CSS animations make webpages lively...'],
      cases: ['Enterprise digital transformation success...', 'E-commerce architecture design...', 'Cloud computing benefits...']
    };
    
    const categories: Record<Section, string[]> = {
      blog: ['Technology', 'Learning', 'Industry'],
      qa: ['Q&A', 'Tutorial', 'FAQ'],
      cases: ['Enterprise', 'Case', 'Analysis']
    };
    
    const title = titles[section][Math.floor(Math.random() * titles[section].length)];
    const content = contents[section][Math.floor(Math.random() * contents[section].length)];
    const category = categories[section][Math.floor(Math.random() * categories[section].length)];
    
    return { title, content, category };
  } catch (error) {
    console.error('AI generation failed:', error);
    return null;
  }
}

// Check duplicate title
async function checkDuplicate(section: Section, title: string): Promise<boolean> {
  try {
    let count = 0;
    switch (section) {
      case 'blog':
        count = await prisma.blogs.count({ where: { title: { contains: title, mode: 'insensitive' } } });
        break;
      case 'qa':
        count = await prisma.qas.count({ where: { title: { contains: title, mode: 'insensitive' } } });
        break;
      case 'cases':
        count = await prisma.cases.count({ where: { title: { contains: title, mode: 'insensitive' } } });
        break;
    }
    return count > 0;
  } catch (error) {
    console.error('Duplicate check failed:', error);
    return false;
  }
}

export async function GET(request: Request) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    const url = new URL(request.url);
    const urlToken = url.searchParams.get('token');
    
    if (!cronSecret || urlToken !== cronSecret) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const now = new Date();
    const utc8Offset = 8 * 60 * 60 * 1000;
    const nowUtc8 = new Date(now.getTime() + utc8Offset);
    const today = new Date(nowUtc8.toDateString());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const publishSettings = await prisma.publishSettings.findMany();
    
    const settingsMap: Record<string, any> = {};
    publishSettings.forEach(setting => {
      settingsMap[setting.section] = setting;
    });

    const defaultSettings = {
      blog: { strategy: 'manual', dailyLimit: 1, randomEnabled: false, scheduleEnabled: false },
      qa: { strategy: 'manual', dailyLimit: 1, randomEnabled: false, scheduleEnabled: false },
      cases: { strategy: 'manual', dailyLimit: 1, randomEnabled: false, scheduleEnabled: false }
    };

    const results = [];

    for (const section of ['blog', 'qa', 'cases'] as Section[]) {
      const settings = { ...defaultSettings[section], ...settingsMap[section] };
      let publishedCount = 0;
      let pendingCount = 0;
      let message = '';

      try {
        if (!settings.randomEnabled && !settings.scheduleEnabled) {
          message = 'Auto publish not enabled';
          results.push({ section, published: 0, pending: 0, message });
          continue;
        }

        let todayPublished = 0;
        switch (section) {
          case 'blog':
            todayPublished = await prisma.blogs.count({ where: { status: 'published', publishedAt: { gte: today, lt: tomorrow } } });
            break;
          case 'qa':
            todayPublished = await prisma.qas.count({ where: { status: 'published', publishedAt: { gte: today, lt: tomorrow } } });
            break;
          case 'cases':
            todayPublished = await prisma.cases.count({ where: { status: 'published', publishedAt: { gte: today, lt: tomorrow } } });
            break;
        }

        if (todayPublished >= settings.dailyLimit) {
          message = `Daily limit reached(${settings.dailyLimit})`;
          results.push({ section, published: 0, pending: 0, message });
          continue;
        }

        const todayLog = await prisma.randomPublishLog.findFirst({
          where: { section, date: { gte: today, lt: tomorrow } }
        });

        if (todayLog) {
          message = `Already generated ${todayLog.publishedCount} today`;
          results.push({ section, published: 0, pending: 0, message });
          continue;
        }

        const article = await generateArticle(section);
        if (!article) {
          message = 'AI generation failed';
          results.push({ section, published: 0, pending: 0, message });
          continue;
        }

        const isDuplicate = await checkDuplicate(section, article.title);

        if (isDuplicate) {
          switch (section) {
            case 'blog':
              await prisma.blogs.create({ data: { title: article.title, content: article.content, category: article.category, status: 'pending', similarTitles: article.title, createdAt: nowUtc8, updatedAt: nowUtc8 } });
              break;
            case 'qa':
              await prisma.qas.create({ data: { title: article.title, content: article.content, category: article.category, status: 'pending', similarTitles: article.title, createdAt: nowUtc8, updatedAt: nowUtc8 } });
              break;
            case 'cases':
              await prisma.cases.create({ data: { title: article.title, content: article.content, category: article.category, status: 'pending', similarTitles: article.title, createdAt: nowUtc8, updatedAt: nowUtc8 } });
              break;
          }
          pendingCount = 1;
          message = 'Duplicate detected, sent to review';
        } else {
          switch (section) {
            case 'blog':
              await prisma.blogs.create({ data: { title: article.title, content: article.content, category: article.category, status: 'published', publishedAt: nowUtc8, createdAt: nowUtc8, updatedAt: nowUtc8 } });
              break;
            case 'qa':
              await prisma.qas.create({ data: { title: article.title, content: article.content, category: article.category, status: 'published', publishedAt: nowUtc8, createdAt: nowUtc8, updatedAt: nowUtc8 } });
              break;
            case 'cases':
              await prisma.cases.create({ data: { title: article.title, content: article.content, category: article.category, status: 'published', publishedAt: nowUtc8, createdAt: nowUtc8, updatedAt: nowUtc8 } });
              break;
          }
          publishedCount = 1;
          message = 'AI generated and published successfully';
        }

        await prisma.randomPublishLog.create({
          data: { section, date: today, publishedCount: publishedCount }
        });

      } catch (error) {
        message = `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }

      results.push({ section, published: publishedCount, pending: pendingCount, message });
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