import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type Section = 'blog' | 'qa' | 'cases';

// Prisma 使用单数模型名
const sectionToModel: Record<Section, string> = {
  blog: 'blog',
  qa: 'qa',
  cases: 'cases'
};

export async function GET(request: Request) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    const url = new URL(request.url);
    const urlToken = url.searchParams.get('token');
    
    if (!cronSecret || urlToken !== cronSecret) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const results = [];
    
    for (const section of ['blog', 'qa', 'cases'] as Section[]) {
      const modelName = sectionToModel[section];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // 使用 Prisma Client 正确的单数形式
      const count = await (prisma[modelName as keyof typeof prisma] as any).count({
        where: { status: 'published', publishedAt: { gte: today } }
      });
      
      results.push({ section, published: count, message: '查询成功' });
    }

    await prisma.$disconnect();
    return new Response(JSON.stringify({ success: true, results }), { status: 200 });
    
  } catch (error) {
    console.error('错误:', error);
    await prisma.$disconnect();
    return new Response(JSON.stringify({ 
      error: '自动发布失败', 
      details: error instanceof Error ? error.message : '未知错误' 
    }), { status: 500 });
  }
}