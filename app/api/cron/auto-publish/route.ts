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

    const results = [];
    
    // 使用正确的 Prisma 模型名
    const sections: Section[] = ['blog', 'qa', 'cases'];
    
    for (const section of sections) {
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // 使用 Prisma 正确的模型名
        const count = await prisma[section].count({
          where: { 
            status: 'published', 
            publishedAt: { gte: today } 
          }
        });
        
        results.push({ section, published: count, message: '查询成功' });
        
      } catch (modelError) {
        results.push({ section, published: 0, message: `模型错误: ${modelError instanceof Error ? modelError.message : '未知'}` });
      }
    }

    await prisma.$disconnect();
    return new Response(JSON.stringify({ success: true, results }), { status: 200 });
    
  } catch (error) {
    console.error('API 错误:', error);
    await prisma.$disconnect();
    return new Response(JSON.stringify({ 
      error: '自动发布失败', 
      details: error instanceof Error ? error.message : '未知错误' 
    }), { status: 500 });
  }
}