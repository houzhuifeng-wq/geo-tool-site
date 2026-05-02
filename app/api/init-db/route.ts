// app/api/init-db/route.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // 创建 publishsettings 表
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "publishsettings" (
        "id" SERIAL PRIMARY KEY,
        "section" TEXT UNIQUE NOT NULL,
        "strategy" TEXT NOT NULL,
        "dailylimit" INTEGER NOT NULL DEFAULT 1,
        "scheduleenabled" BOOLEAN NOT NULL DEFAULT false,
        "scheduletime" TEXT NOT NULL DEFAULT '08:00',
        "randomenabled" BOOLEAN NOT NULL DEFAULT false,
        "randomtargettime" TEXT,
        "randomtargetdate" TIMESTAMP,
        "createdat" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedat" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 创建 randompublishlog 表
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "randompublishlog" (
        "id" SERIAL PRIMARY KEY,
        "section" TEXT NOT NULL,
        "date" TIMESTAMP NOT NULL,
        "publishedcount" INTEGER NOT NULL,
        "createdat" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE ("section", "date")
      );
    `);

    // 初始化默认设置
    await prisma.$executeRawUnsafe(`
      INSERT INTO "publishsettings" ("section", "strategy", "dailylimit", "scheduleenabled", "scheduletime", "randomenabled")
      VALUES 
        ('blog', 'manual', 1, false, '08:00', false),
        ('qa', 'manual', 1, false, '08:00', false),
        ('cases', 'manual', 1, false, '08:00', false)
      ON CONFLICT ("section") DO NOTHING;
    `);

    await prisma.$disconnect();
    return new Response(JSON.stringify({ success: true, message: '数据库表创建成功' }), { status: 200 });
    
  } catch (error) {
    await prisma.$disconnect();
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : '未知错误' }), { status: 500 });
  }
}