// app/api/qa/route.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const items = await prisma.qA.findMany({
      where: { status: 'published' },
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true,
        title: true,
        content: true,
        category: true,
        publishedAt: true
      }
    });

    const qaItems = items.map(item => ({
      id: item.id,
      title: item.title,
      excerpt: item.content.substring(0, 100) + '...',
      date: item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('zh-CN') : new Date().toLocaleDateString('zh-CN'),
      category: item.category,
      answer: item.content
    }));

    await prisma.$disconnect();
    return new Response(JSON.stringify(qaItems), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('获取问答失败:', error);
    await prisma.$disconnect();
    return new Response(JSON.stringify({ error: '获取问答失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}