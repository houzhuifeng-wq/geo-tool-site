'use client';

import { useState, useEffect } from 'react';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  content: string;
}

const getBlogPosts = async () => {
  try {
    const response = await fetch('/api/blog');
    if (!response.ok) throw new Error('Failed');
    return await response.json();
  } catch (error) {
    return [
      { id: '1', title: 'GEO优化基础入门', excerpt: '入门指南...', date: '2024-04-01', category: '基础教程', content: '内容...' },
      { id: '2', title: '本地SEO技巧', excerpt: '优化技巧...', date: '2024-03-25', category: '本地SEO', content: '内容...' }
    ];
  }
};

export default function BlogPage() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBlogPosts().then(posts => {
      setBlogPosts(posts);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex justify-center items-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">GEO优化博客</h1>
          <p className="text-lg">探索GEO优化的最新策略</p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.map(post => (
            <div key={post.id} className="bg-white rounded-lg shadow-md p-6">
              <span className="inline-block px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full mb-3">{post.category}</span>
              <h3 className="text-xl font-bold mb-2">{post.title}</h3>
              <p className="text-gray-600 mb-4">{post.excerpt}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{post.date}</span>
                <button className="text-blue-600 hover:text-blue-800">阅读更多 →</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}