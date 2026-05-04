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
      title: 'GEO优化案例分析：如何将排名提升50位',
      excerpt: '通过真实案例分析，本文将展示我们如何帮助客户在3个月内将GEO相关关键词排名提升50位。',
      date: '2024-03-05',
      category: '案例分析',
      content: '在这个案例中，我们帮助一家本地企业...'
    }
  ];
};

export default function BlogPage() {
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [blogPosts, setBlogPosts] = useState<any[]>([]);

  // 从localStorage加载数据
  useEffect(() => {
    const savedPosts = localStorage.getItem('blogPosts');
    if (savedPosts) {
      const posts = JSON.parse(savedPosts);
      // 过滤已发布的文章并按日期倒序排序
      const publishedPosts = posts
        .filter((post: any) => post.status === 'published')
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setBlogPosts(publishedPosts);
    } else {
      // 默认数据
      const defaultPosts = [
        {
          id: '1',
          title: 'GEO优化基础入门：从0到1的完整指南',
          excerpt: '本文将为您介绍GEO优化的基本概念、重要性以及实施步骤，帮助您快速入门GEO优化领域。',
          date: '2024-04-01',
          category: '基础教程',
          content: 'GEO优化是一种针对地理位置的搜索引擎优化策略...',
          status: 'published'
        },
        {
          id: '2',
          title: '如何通过GEO优化提升本地搜索排名',
          excerpt: '本地搜索排名对实体企业至关重要，本文将分享如何通过GEO优化策略提升本地搜索可见性。',
          date: '2024-03-25',
          category: '本地SEO',
          content: '本地搜索排名是实体企业获取客户的重要途径...',
          status: 'published'
        },
        {
          id: '3',
          title: 'GEO优化中的关键词策略：如何选择和布局',
          excerpt: '关键词是GEO优化的核心，本文将详细介绍如何选择适合的GEO关键词并进行合理布局。',
          date: '2024-03-18',
          category: '关键词策略',
          content: '关键词选择是GEO优化的基础...',
          status: 'published'
        },
        {
          id: '4',
          title: '移动设备上的GEO优化：提升移动端用户体验',
          excerpt: '移动搜索日益重要，本文将分享如何针对移动设备进行GEO优化，提升用户体验和排名。',
          date: '2024-03-10',
          category: '移动端优化',
          content: '移动设备已经成为人们获取信息的主要方式...',
          status: 'published'
        },
        {
          id: '5',
          title: 'GEO优化案例分析：如何将排名提升50位',
          excerpt: '通过真实案例分析，本文将展示我们如何帮助客户在3个月内将GEO相关关键词排名提升50位。',
          date: '2024-03-05',
          category: '案例分析',
          content: '在这个案例中，我们帮助一家本地企业...',
          status: 'published'
        }
      ];
      setBlogPosts(defaultPosts);
    }
  }, []);
  
  // 提取所有分类
  const categories = ['all', ...Array.from(new Set(blogPosts.map((post: any) => post.category)))];
  
  // 过滤博客文章
  const filteredPosts = blogPosts.filter((post: any) => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <nav className="bg-blue-900 text-white shadow-md fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* 左侧品牌名 */}
            <div className="flex items-center">
              <span className="text-xl font-bold">易云网络</span>
            </div>
            
            {/* 中间导航链接 - 桌面端 */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="/" className="text-white hover:text-blue-200">
                首页 / 检测工具
              </a>
              <a href="/blog" className="text-white hover:text-blue-200 font-medium border-b-2 border-white pb-1">
                博客教程
              </a>
              <a href="/cases" className="text-white hover:text-blue-200">
                客户方案
              </a>
              <a href="/qa" className="text-white hover:text-blue-200">
                行业问答
              </a>
            </div>
            
            {/* 右侧按钮 */}
            <div className="flex items-center">
              <button 
                onClick={() => setShowServiceModal(true)}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium"
              >
                专业GEO服务
              </button>
            </div>
            
            {/* 移动端菜单按钮 */}
            <div className="md:hidden flex items-center">
              <button className="text-white hover:text-blue-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      {/* 服务弹窗 */}
      {showServiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">联系我们</h3>
              <button 
                onClick={() => setShowServiceModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-gray-800">易云网络（侯客有道）团队</p>
              <p className="text-gray-800">服务电话：13953631472</p>
              <div className="mt-6">
                <button 
                  onClick={() => setShowServiceModal(false)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-medium"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 博客列表 */}
      <section className="py-12 pt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">GEO优化教程</h1>
          
          {/* 搜索和分类筛选 */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="w-full md:w-1/2">
                <input
                  type="text"
                  placeholder="搜索文章..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="w-full md:w-1/3">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category === 'all' ? '全部分类' : category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {/* 博客列表 */}
          {blogPosts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              暂无博客文章
            </div>
          ) : (
            <div className="space-y-8">
              {filteredPosts.map((post: { id: string; title: string; excerpt: string; date: string; category: string; content: string }) => (
                <Link 
                  key={post.id} 
                  href={`/blog/${post.id}`}
                  className="block bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-500">{post.date}</span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {post.category}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h2>
                    <p className="text-gray-600 mb-4">{post.excerpt}</p>
                    <div className="flex justify-end">
                      <span className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        阅读更多 →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          {filteredPosts.length === 0 && blogPosts.length > 0 && (
            <div className="text-center py-12 text-gray-500">
              没有找到符合条件的博客文章
            </div>
          )}
        </div>
      </section>

      {/* 页脚 */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">易云网络</h3>
              <p className="text-gray-400">专业的GEO优化解决方案提供商</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">联系我们</h3>
              <p className="text-gray-400">易云网络（侯客有道）团队</p>
              <p className="text-gray-400">服务电话：13953631472</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">服务范围</h3>
              <p className="text-gray-400">GEO优化</p>
              <p className="text-gray-400">搜索引擎优化</p>
              <p className="text-gray-400">网站性能优化</p>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-700 pt-8 text-center text-gray-400">
            <p>© 2024 易云网络. 保留所有权利.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}