// app/api/cron/auto-publish/route.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type Section = 'blog' | 'qa' | 'cases';

const sectionToTable: Record<Section, string> = {
  blog: 'blogs',
  qa: 'qas',
  cases: 'cases'
};

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
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    for (const section of ['blog', 'qa', 'cases'] as Section[]) {
      const tableName = sectionToTable[section];
      
      try {
        // 使用原始 SQL 查询
        const result = await prisma.$queryRawUnsafe(`
          SELECT COUNT(*) as count 
          FROM "${tableName}" 
          WHERE status = 'published' 
            AND DATE(publishedat) = $1
        `, today);
        
        const count = result.length > 0 ? (result[0] as any).count : 0;
        
        results.push({ section, published: count, message: '查询成功' });
        
      } catch (error) {
        results.push({ section, published: 0, message: `查询失败: ${error instanceof Error ? error.message : '未知'}` });
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