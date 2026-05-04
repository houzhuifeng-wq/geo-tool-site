import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const posts = await prisma.blog.findMany({
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

    const blogPosts = posts.map(post => ({
      id: post.id,
      title: post.title,
      excerpt: post.content.substring(0, 150) + '...',
      date: post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('zh-CN') : new Date().toLocaleDateString('zh-CN'),
      category: post.category,
      content: post.content,
      publishedAt: post.publishedAt
    }));

    await prisma.$disconnect();
    return new Response(JSON.stringify(blogPosts), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('获取博客文章失败:', error);
    await prisma.$disconnect();
    return new Response(JSON.stringify({ error: '获取博客文章失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}