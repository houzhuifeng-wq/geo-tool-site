// app/api/cron/auto-publish/route.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
    const todayStr = nowUtc8.toISOString().split('T')[0];

    const results = [];
    const sections = ['blog', 'qa', 'cases'];
    const tableNames: Record<string, string> = { blog: 'blogs', qa: 'qas', cases: 'cases' };

    for (const section of sections) {
      const tableName = tableNames[section];
      let publishedCount = 0;
      let pendingCount = 0;
      let message = '';

      try {
        // Get settings from database
        const settingsResult = await prisma.$queryRawUnsafe(`
          SELECT dailyLimit, randomEnabled, scheduleEnabled 
          FROM "publishSettings" 
          WHERE section = '${section}'
        `) as any[];
        
        const settings = settingsResult.length > 0 ? settingsResult[0] : null;
        const dailyLimit = settings?.dailyLimit || 1;
        const randomEnabled = settings?.randomEnabled || false;
        const scheduleEnabled = settings?.scheduleEnabled || false;

        if (!randomEnabled && !scheduleEnabled) {
          message = 'Auto publish not enabled';
          results.push({ section, published: 0, pending: 0, message });
          continue;
        }

        // Check daily limit
        const todayPublishedResult = await prisma.$queryRawUnsafe(`
          SELECT COUNT(*) as count 
          FROM "${tableName}" 
          WHERE status = 'published' 
            AND publishedAt >= '${todayStr}T00:00:00+08:00'
        `) as any[];
        const todayPublished = todayPublishedResult[0]?.count || 0;

        if (todayPublished >= dailyLimit) {
          message = `Daily limit reached(${dailyLimit})`;
          results.push({ section, published: 0, pending: 0, message });
          continue;
        }

        // Check if already generated today
        const todayLogResult = await prisma.$queryRawUnsafe(`
          SELECT publishedCount 
          FROM "randomPublishLog" 
          WHERE section = '${section}' 
            AND date >= '${todayStr}T00:00:00+08:00'
        `) as any[];
        
        if (todayLogResult.length > 0) {
          message = `Already generated ${todayLogResult[0].publishedCount} today`;
          results.push({ section, published: 0, pending: 0, message });
          continue;
        }

        // AI generate article (simulated)
        const titles: Record<string, string[]> = {
          blog: ['How to learn programming', 'AI introduction', 'Frontend development'],
          qa: ['What is JavaScript?', 'How to use React?', 'CSS tutorial'],
          cases: ['Enterprise transformation', 'E-commerce solution']
        };
        
        const contents: Record<string, string[]> = {
          blog: ['Content 1...', 'Content 2...', 'Content 3...'],
          qa: ['QA 1...', 'QA 2...', 'QA 3...'],
          cases: ['Case 1...', 'Case 2...']
        };
        
        const categories: Record<string, string[]> = {
          blog: ['Technology', 'Learning', 'Industry'],
          qa: ['Q&A', 'Tutorial', 'FAQ'],
          cases: ['Enterprise', 'Case', 'Analysis']
        };

        const title = titles[section][Math.floor(Math.random() * titles[section].length)];
        const content = contents[section][Math.floor(Math.random() * contents[section].length)];
        const category = categories[section][Math.floor(Math.random() * categories[section].length)];

        // Check duplicate
        const duplicateResult = await prisma.$queryRawUnsafe(`
          SELECT COUNT(*) as count 
          FROM "${tableName}" 
          WHERE title ILIKE '%${title}%'
        `) as any[];
        const isDuplicate = (duplicateResult[0]?.count || 0) > 0;

        const createdAtStr = nowUtc8.toISOString();

        if (isDuplicate) {
          await prisma.$queryRawUnsafe(`
            INSERT INTO "${tableName}" (title, content, category, status, similarTitles, createdAt, updatedAt)
            VALUES ('${title}', '${content}', '${category}', 'pending', '${title}', '${createdAtStr}', '${createdAtStr}')
          `);
          pendingCount = 1;
          message = 'Duplicate, sent to review';
        } else {
          await prisma.$queryRawUnsafe(`
            INSERT INTO "${tableName}" (title, content, category, status, publishedAt, createdAt, updatedAt)
            VALUES ('${title}', '${content}', '${category}', 'published', '${createdAtStr}', '${createdAtStr}', '${createdAtStr}')
          `);
          publishedCount = 1;
          message = 'AI generated and published';
        }

        await prisma.$queryRawUnsafe(`
          INSERT INTO "randomPublishLog" (section, date, publishedCount)
          VALUES ('${section}', '${todayStr}T00:00:00+08:00', ${publishedCount})
        `);

      } catch (error) {
        message = `Failed: ${error instanceof Error ? error.message.substring(0, 80) : 'Unknown'}`;
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