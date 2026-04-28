// Q&A page with list view

"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function QAPage() {
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [qaItems, setQaItems] = useState<any[]>([]);

  // 从localStorage加载数据
  useEffect(() => {
    const savedQAs = localStorage.getItem('qaItems');
    if (savedQAs) {
      const items = JSON.parse(savedQAs);
      // 过滤已发布的问答并按日期倒序排序
      const publishedQAs = items
        .filter((item: any) => item.status === 'published')
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setQaItems(publishedQAs);
    }
  }, []);
  
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
              <a href="/blog" className="text-white hover:text-blue-200">
                博客教程
              </a>
              <a href="/cases" className="text-white hover:text-blue-200">
                客户案例
              </a>
              <a href="/qa" className="text-white hover:text-blue-200 font-medium border-b-2 border-white pb-1">
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

      {/* 问答列表 */}
      <section className="py-12 pt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">行业常见问题</h1>
          
          {qaItems.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              暂无问答内容
            </div>
          ) : (
            <div className="space-y-6">
              {qaItems.map((item) => (
                <Link 
                  key={item.id} 
                  href={`/qa/${item.id}`}
                  className="block bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                        {item.category}
                      </span>
                    </div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-2">{item.question}</h2>
                    <p className="text-gray-600">{item.excerpt || item.answer.substring(0, 100) + '...'}</p>
                    <div className="mt-4 text-blue-600 text-sm font-medium">
                      查看详细回答 →
                    </div>
                  </div>
                </Link>
              ))}
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