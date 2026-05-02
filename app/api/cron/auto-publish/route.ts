import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type Section = 'blog' | 'qa' | 'cases';

const sectionToModel: Record<Section, string> = {
  blog: 'blogs',
  qa: 'qas',
  cases: 'cases'
};

export async function GET(request: Request) {
  console.log('=== 自动发布 API 开始 ===');
  
  try {
    // 验证 CRON_SECRET
    const cronSecret = process.env.CRON_SECRET;
    console.log('CRON_SECRET 已设置:', !!cronSecret);
    
    if (!cronSecret) {
      console.error('错误: CRON_SECRET 未设置');
      return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500 });
    }

    const url = new URL(request.url);
    const urlToken = url.searchParams.get('token');
    console.log('收到的 token:', urlToken ? '已提供' : '未提供');
    
    if (urlToken !== cronSecret) {
      console.error('错误: token 验证失败');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    // 测试数据库连接
    console.log('正在测试数据库连接...');
    const dbTest = await prisma.$queryRaw`SELECT 1`;
    console.log('数据库连接成功:', dbTest);

    // 查询 PublishSettings
    console.log('正在查询 PublishSettings...');
    const publishSettings = await prisma.publishSettings.findMany();
    console.log('PublishSettings 查询结果:', publishSettings.length);

    // 查询待发布文章
    console.log('正在查询待发布文章...');
    const pendingBlogs = await prisma.blogs.findMany({ where: { status: 'pending' } });
    console.log('待发布博客数量:', pendingBlogs.length);

    // 发布逻辑
    const results = [];
    
    for (const section of ['blog', 'qa', 'cases'] as Section[]) {
      const modelName = sectionToModel[section];
      console.log(`处理板块: ${section}, 模型: ${modelName}`);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const count = await (prisma[modelName as keyof typeof prisma] as any).count({
        where: { status: 'published', publishedAt: { gte: today } }
      });
      console.log(`${section} 今日已发布: ${count}`);
      
      results.push({ section, published: 0, message: '测试完成' });
    }

    await prisma.$disconnect();
    console.log('=== 自动发布 API 成功 ===');
    
    return new Response(JSON.stringify({ success: true, results }), { status: 200 });
    
  } catch (error) {
    console.error('=== 自动发布 API 错误 ===');
    console.error('错误类型:', error instanceof Error ? error.name : 'Unknown');
    console.error('错误消息:', error instanceof Error ? error.message : error);
    console.error('错误堆栈:', error instanceof Error ? error.stack : 'N/A');
    
    await prisma.$disconnect();
    
    return new Response(JSON.stringify({ 
      error: '自动发布失败', 
      details: error instanceof Error ? error.message : '未知错误' 
    }), { status: 500 });
  }
}