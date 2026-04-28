"use client";
// Case detail page

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function CaseDetailPage() {
  const params = useParams();
  const caseId = params.id as string;
  const [caseItem, setCaseItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showServiceModal, setShowServiceModal] = useState(false);

  useEffect(() => {
    // 从localStorage加载案例数据
    const savedCases = localStorage.getItem('caseStudies');
    if (savedCases) {
      const items = JSON.parse(savedCases);
      // 查找对应ID的案例
      const foundItem = items.find((item: any) => item.id === caseId);
      // 检查案例是否存在且已发布
      if (foundItem && foundItem.status === 'published') {
        setCaseItem(foundItem);
      }
    }
    setLoading(false);
  }, [caseId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-blue-900 text-white shadow-md fixed w-full z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <span className="text-xl font-bold">易云网络</span>
              </div>
              <div className="hidden md:flex items-center space-x-8">
                <a href="/" className="text-white hover:text-blue-200">
                  首页 / 检测工具
                </a>
                <a href="/blog" className="text-white hover:text-blue-200">
                  博客教程
                </a>
                <a href="/cases" className="text-white hover:text-blue-200 font-medium border-b-2 border-white pb-1">
                  客户案例
                </a>
                <a href="/qa" className="text-white hover:text-blue-200">
                  行业问答
                </a>
              </div>
              <div className="flex items-center">
                <button 
                  onClick={() => setShowServiceModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium"
                >
                  专业GEO服务
                </button>
              </div>
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded mb-4"></div>
            <div className="h-6 bg-gray-200 rounded mb-2"></div>
            <div className="h-6 bg-gray-200 rounded mb-2"></div>
            <div className="h-6 bg-gray-200 rounded mb-6"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!caseItem) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-blue-900 text-white shadow-md fixed w-full z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <span className="text-xl font-bold">易云网络</span>
              </div>
              <div className="hidden md:flex items-center space-x-8">
                <a href="/" className="text-white hover:text-blue-200">
                  首页 / 检测工具
                </a>
                <a href="/blog" className="text-white hover:text-blue-200">
                  博客教程
                </a>
                <a href="/cases" className="text-white hover:text-blue-200 font-medium border-b-2 border-white pb-1">
                  客户案例
                </a>
                <a href="/qa" className="text-white hover:text-blue-200">
                  行业问答
                </a>
              </div>
              <div className="flex items-center">
                <button 
                  onClick={() => setShowServiceModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium"
                >
                  专业GEO服务
                </button>
              </div>
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
        <section className="py-12 pt-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">案例不存在</h1>
            <p className="text-gray-600 mb-8">您访问的案例不存在或已被删除。</p>
            <Link 
              href="/cases" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium"
            >
              返回案例列表
            </Link>
          </div>
        </section>
      </div>
    );
  }

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
              <a href="/cases" className="text-white hover:text-blue-200 font-medium border-b-2 border-white pb-1">
                客户案例
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

      {/* 案例内容 */}
      <section className="py-12 pt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="flex justify-between items-center mb-6">
              <span className="text-sm text-gray-500">{caseItem.date}</span>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                {caseItem.industry}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">{caseItem.title}</h1>
            <div className="prose max-w-none">
              {caseItem.content.split('\n').map((line: string, index: number) => {
                if (line.startsWith('# ')) {
                  return <h1 key={index} className="text-2xl font-bold mt-8 mb-4">{line.substring(2)}</h1>;
                } else if (line.startsWith('## ')) {
                  return <h2 key={index} className="text-xl font-semibold mt-6 mb-3">{line.substring(3)}</h2>;
                } else if (line.startsWith('### ')) {
                  return <h3 key={index} className="text-lg font-medium mt-4 mb-2">{line.substring(4)}</h3>;
                } else if (line.startsWith('- ')) {
                  return <li key={index} className="mb-1">{line.substring(2)}</li>;
                } else if (line.startsWith('> ')) {
                  return <blockquote key={index} className="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4">{line.substring(2)}</blockquote>;
                } else if (line.trim() === '') {
                  return <br key={index} />;
                } else {
                  return <p key={index} className="mb-4">{line}</p>;
                }
              })}
            </div>
            <div className="mt-8 pt-6 border-t border-gray-200">
              <Link 
                href="/cases" 
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                ← 返回案例列表
              </Link>
            </div>
          </div>
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