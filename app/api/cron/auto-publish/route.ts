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

    const results = [];
    const sections = ['blog', 'qa', 'cases'];

    for (const section of sections) {
      let publishedCount = 0;
      let pendingCount = 0;
      let message = '';

      try {
        // 先检查是否启用自动发布（使用正确的表名）
        const settingsResult = await prisma.$queryRawUnsafe(`
          SELECT dailyLimit, randomEnabled, scheduleEnabled 
          FROM "publishsettings" 
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

        message = 'Settings loaded successfully';

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