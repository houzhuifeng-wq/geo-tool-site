'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function WhitelistPage() {
  const [domains, setDomains] = useState<string[]>([]);
  const [newDomain, setNewDomain] = useState('');
  const [message, setMessage] = useState('');
  
  const router = useRouter();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!isLoggedIn) {
      router.push('/admin');
    }

    const savedDomains = localStorage.getItem('geoWhitelist');
    if (savedDomains) {
      setDomains(JSON.parse(savedDomains));
    } else {
      const defaultDomains = ['www.your-site.com', 'your-success-site.com'];
      setDomains(defaultDomains);
      localStorage.setItem('geoWhitelist', JSON.stringify(defaultDomains));
    }
  }, [router]);

  const handleAddDomain = () => {
    if (!newDomain.trim()) {
      setMessage('请输入域名');
      return;
    }
    if (domains.includes(newDomain.trim())) {
      setMessage('域名已存在');
      return;
    }

    const updatedDomains = [...domains, newDomain.trim()];
    setDomains(updatedDomains);
    localStorage.setItem('geoWhitelist', JSON.stringify(updatedDomains));
    setNewDomain('');
    setMessage('域名添加成功！');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleRemoveDomain = (domain: string) => {
    const updatedDomains = domains.filter(d => d !== domain);
    setDomains(updatedDomains);
    localStorage.setItem('geoWhitelist', JSON.stringify(updatedDomains));
    setMessage('域名已删除');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    router.push('/admin');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-blue-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold">后台管理系统</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm">管理员</span>
              <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md text-sm font-medium">
                退出登录
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        <aside className="w-64 bg-white border-r border-gray-200 h-screen fixed">
          <div className="py-4">
            <nav className="space-y-1 px-2">
              <a href="/admin/dashboard" className="text-gray-700 hover:bg-blue-50 hover:text-blue-700 group flex items-center px-2 py-2 text-base font-medium rounded-md">首页</a>
              <a href="/admin/detection-records" className="text-gray-700 hover:bg-blue-50 hover:text-blue-700 group flex items-center px-2 py-2 text-base font-medium rounded-md">检测记录管理</a>
              <a href="/admin/whitelist" className="bg-blue-50 text-blue-700 group flex items-center px-2 py-2 text-base font-medium rounded-md">网站白名单</a>
              <a href="/admin/customer-messages" className="text-gray-700 hover:bg-blue-50 hover:text-blue-700 group flex items-center px-2 py-2 text-base font-medium rounded-md">客户留言管理</a>
              <a href="/admin/blog" className="text-gray-700 hover:bg-blue-50 hover:text-blue-700 group flex items-center px-2 py-2 text-base font-medium rounded-md">博客管理</a>
              <a href="/admin/cases" className="text-gray-700 hover:bg-blue-50 hover:text-blue-700 group flex items-center px-2 py-2 text-base font-medium rounded-md">方案管理</a>
              <a href="/admin/qa" className="text-gray-700 hover:bg-blue-50 hover:text-blue-700 group flex items-center px-2 py-2 text-base font-medium rounded-md">问答管理</a>
              <a href="/admin/ai-config" className="text-gray-700 hover:bg-blue-50 hover:text-blue-700 group flex items-center px-2 py-2 text-base font-medium rounded-md">AI配置</a>
            </nav>
          </div>
        </aside>

        <main className="ml-64 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">网站白名单管理</h1>
            </div>

            {message && (
              <div className={`mb-4 p-3 rounded-md ${message.includes('成功') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {message}
              </div>
            )}

            <div className="mb-6 p-4 border border-gray-200 rounded-md bg-gray-50">
              <h2 className="text-lg font-medium text-gray-900 mb-4">添加新域名</h2>
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  placeholder="例如: www.example.com"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddDomain()}
                />
                <button onClick={handleAddDomain} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium">
                  添加
                </button>
              </div>
            </div>

            <div className="p-4 border border-gray-200 rounded-md">
              <h2 className="text-lg font-medium text-gray-900 mb-4">白名单域名列表</h2>
              
              {domains.length === 0 ? (
                <p className="text-gray-500 text-center py-8">暂无白名单域名</p>
              ) : (
                <ul className="space-y-2">
                  {domains.map((domain, index) => (
                    <li key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <span className="text-gray-900">{domain}</span>
                      <button onClick={() => handleRemoveDomain(domain)} className="text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded-md text-sm font-medium">
                        删除
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-6 p-4 border border-gray-200 rounded-md bg-blue-50">
              <h2 className="text-lg font-medium text-blue-900 mb-2">使用说明</h2>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 白名单中的域名在GEO检测时会获得高分（85-95分）</li>
                <li>• 可以添加公司官网或客户成功案例作为展示</li>
                <li>• 域名格式：不需要 http:// 或 https://，直接输入域名即可</li>
              </ul>
            </div>
          </div>
        </main>
      </div>

      <footer className="bg-gray-800 text-white py-4 ml-64 fixed bottom-0 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>易云网络（侯客有道）团队 服务电话：13953631472</p>
        </div>
      </footer>
    </div>
  );
}