// app/api/test-db/route.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // 测试数据库连接
    const result = await prisma.$queryRaw`SELECT 1`;
    console.log('数据库连接成功:', result);
    
    // 测试创建表
    try {
      const settings = await prisma.publishSettings.findMany({ take: 1 });
      console.log('publishSettings 表查询成功:', settings.length);
    } catch (error) {
      console.error('publishSettings 表查询失败:', error);
      await prisma.$disconnect();
      return new Response(JSON.stringify({ 
        error: 'publishSettings 表不存在', 
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