'use client';

// Blog page with list view

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  content: string;
  publishedAt?: string;
}

// 从后端API获取博客数据
const getBlogPosts = async (): Promise<BlogPost[]> => {
  try {
    const response = await fetch('/api/blog');
    if (!response.ok) {
      throw new Error('Failed to fetch blog posts');
    }
    const posts = await response.json();
    return posts;
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    // 返回默认数据
    return [
      {
        id: '1',
        title: 'GEO优化基础入门：从0到1的完整指南',
        excerpt: '本文将为您介绍GEO优化的基本概念、重要性以及实施步骤，帮助您快速入门GEO优化领域。',
        date: '2024-04-01',
        category: '基础教程',
        content: 'GEO优化是一种针对地理位置的搜索引擎优化策略...'
      },
      {
        id: '2',
        title: '如何通过GEO优化提升本地搜索排名',
        excerpt: '本地搜索排名对实体企业至关重要，本文将分享如何通过GEO优化策略提升本地搜索可见性。',
        date: '2024-03-25',
        category: '本地SEO',
        content: '本地搜索排名是实体企业获取客户的重要途径...'
      },
      {
        id: '3',
        title: 'GEO优化中的关键词策略：如何选择和布局',
        excerpt: '关键词是GEO优化的核心，本文将详细介绍如何选择适合的GEO关键词并进行合理布局。',
        date: '2024-03-18',
        category: '关键词策略',
        content: '关键词选择是GEO优化的基础...'
      },
      {
        id: '4',
        title: '移动设备上的GEO优化：提升移动端用户体验',
        excerpt: '移动搜索日益重要，本文将分享如何针对移动设备进行GEO优化，提升用户体验和排名。',
        date: '2024-03-10',
        category: '移动端优化',
        content: '移动设备已经成为人们获取信息的主要方式...'
      },
      {
        id: '5',
        title: 'GEO优化案例分析：成功案例分享',
        excerpt: '通过实际案例分析，了解成功的GEO优化策略是如何实施的，为您的优化工作提供参考。',
        date: '2024-02-28',
        category: '案例分析',
        content: '以下是一些成功的GEO优化案例...'
      }
    ];
  }
};

export default function BlogPage() {
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      const posts = await getBlogPosts();
      setBlogPosts(posts);
      setLoading(false);
    };
    fetchPosts();
  }, []);

  // 获取所有分类
  const categories = ['all', ...new Set(blogPosts.map(post => post.category))];

  // 过滤文章
  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">GEO优化博客</h1>
          <p className="text-lg opacity-90">探索GEO优化的最新策略和最佳实践</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Blog List */}
          <div className="flex-1">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <input
                type="text"
                placeholder="搜索文章..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? '全部分类' : category}
                  </option>
                ))}
              </select>
            </div>

            {/* Blog Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map(post => (
                <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <span className="inline-block px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full mb-3">
                      {post.category}
                    </span>
                    <h3 className="text-xl font-bold mb-2 text-gray-800 hover:text-blue-600 cursor-pointer">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{post.date}</span>
                      <button
                        onClick={() => {
                          // Handle read more
                        }}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        阅读更多 →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredPosts.length === 0 && (
              <div className="text-center py-16">
                <p className="text-gray-500">没有找到匹配的文章</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:w-80">
            {/* Categories */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-bold mb-4">分类</h2>
              <ul className="space-y-2">
                {categories.map(category => (
                  <li key={category}>
                    <button
                      onClick={() => setSelectedCategory(category)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                        selectedCategory === category
                          ? 'bg-blue-500 text-white'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      {category === 'all' ? '全部' : category}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg shadow-md p-6 text-white">
              <h2 className="text-lg font-bold mb-4">订阅我们的博客</h2>
              <p className="mb-4">获取最新的GEO优化技巧和资讯</p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="输入您的邮箱"
                  className="flex-1 px-4 py-2 rounded-l-lg focus:outline-none"
                />
                <button className="px-4 py-2 bg-white text-blue-600 font-medium rounded-r-lg hover:bg-gray-100 transition-colors">
                  订阅
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="mb-4 md:mb-0">© 2024 GEO优化博客. 保留所有权利.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-blue-400">关于我们</a>
              <a href="#" className="hover:text-blue-400">联系方式</a>
              <a href="#" className="hover:text-blue-400">隐私政策</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}