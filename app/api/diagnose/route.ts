// app/api/diagnose/route.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const results: Record<string, any> = {};
  
  try {
    // 测试数据库连接
    results.database = {};
    try {
      await prisma.$queryRaw`SELECT 1`;
      results.database.connected = true;
      results.database.message = '数据库连接成功';
    } catch (error) {
      results.database.connected = false;
      results.database.error = error instanceof Error ? error.message : '连接失败';
      await prisma.$disconnect();
      return new Response(JSON.stringify(results), { status: 500 });
    }
    
    // 测试表是否存在
    const tables = ['publishsettings', 'blogs', 'qas', 'cases', 'randompublishlog'];
    results.tables = {};
    
    for (const table of tables) {
      try {
        await prisma.$queryRawUnsafe(`SELECT 1 FROM "${table}" LIMIT 1`);
        results.tables[table] = { exists: true };
      } catch (error) {
        results.tables[table] = { exists: false, error: error instanceof Error ? error.message : '未知错误' };
      }
    }
    
    await prisma.$disconnect();
    return new Response(JSON.stringify({ success: true, ...results }), { status: 200 });
    
  } catch (error) {
    await prisma.$disconnect();
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : '未知错误' 
    }), { status: 500 });
  }
}