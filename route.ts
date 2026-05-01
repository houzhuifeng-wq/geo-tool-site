import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // 测试数据库连接
    const result = await prisma.$queryRaw`SELECT 1`;
    console.log('数据库连接成功:', result);
    
    // 测试 blogs 表
    try {
      const blogs = await prisma.blogs.findMany({ take: 1 });
      console.log('blogs 表查询成功:', blogs.length);
    } catch (error) {
      console.error('blogs 表查询失败:', error);
      await prisma.$disconnect();
      return new Response(JSON.stringify({ 
        error: 'blogs 表不存在', 
        details: error instanceof Error ? error.message : '未知错误' 
      }), { status: 500 });
    }
    
    await prisma.$disconnect();
    return new Response(JSON.stringify({ success: true, message: '数据库连接和表查询成功' }), { status: 200 });
  } catch (error) {
    console.error('数据库连接失败:', error);
    await prisma.$disconnect();
    return new Response(JSON.stringify({ 
      error: '数据库连接失败', 
      details: error instanceof Error ? error.message : '未知错误' 
    }), { status: 500 });
  }
}