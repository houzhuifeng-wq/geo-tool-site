"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type CustomerMessage = {
  id: string;
  name: string;
  phone: string;
  company: string;
  demand: string;
  timestamp: string;
};

export default function CustomerMessagesPage() {
  const [messages, setMessages] = useState<CustomerMessage[]>([]);
  const router = useRouter();

  useEffect(() => {
    // 检查登录状态
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!isLoggedIn) {
      router.push('/admin');
    }

    // 从localStorage加载数据
    const savedMessages = localStorage.getItem('customerMessages');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    router.push('/admin');
  };

  const handleDeleteMessage = (id: string) => {
    const updatedMessages = messages.filter(message => message.id !== id);
    setMessages(updatedMessages);
    localStorage.setItem('customerMessages', JSON.stringify(updatedMessages));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <nav className="bg-blue-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold">后台管理系统</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm">管理员</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md text-sm font-medium"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 侧边导航 */}
      <div className="flex">
        <div className="w-64 bg-white border-r border-gray-200 h-screen fixed">
          <div className="py-4">
            <nav className="space-y-1 px-2">
              <a
                href="/admin/dashboard"
                className="text-gray-700 hover:bg-blue-50 hover:text-blue-700 group flex items-center px-2 py-2 text-base font-medium rounded-md"
              >
                首页
              </a>
              <a
                href="/admin/detection-records"
                className="text-gray-700 hover:bg-blue-50 hover:text-blue-700 group flex items-center px-2 py-2 text-base font-medium rounded-md"
              >
                检测记录管理
              </a>
              <a
                href="/admin/customer-messages"
                className="bg-blue-50 text-blue-700 group flex items-center px-2 py-2 text-base font-medium rounded-md"
              >
                客户留言管理
              </a>
              <a
                href="/admin/blog"
                className="text-gray-700 hover:bg-blue-50 hover:text-blue-700 group flex items-center px-2 py-2 text-base font-medium rounded-md"
              >
                博客管理
              </a>
              <a
                href="/admin/cases"
                className="text-gray-700 hover:bg-blue-50 hover:text-blue-700 group flex items-center px-2 py-2 text-base font-medium rounded-md"
              >
                方案管理
              </a>
              <a
                href="/admin/qa"
                className="text-gray-700 hover:bg-blue-50 hover:text-blue-700 group flex items-center px-2 py-2 text-base font-medium rounded-md"
              >
                问答管理
              </a>
              <a
                href="/admin/ai-config"
                className="text-gray-700 hover:bg-blue-50 hover:text-blue-700 group flex items-center px-2 py-2 text-base font-medium rounded-md"
              >
                AI配置
              </a>
            </nav>
          </div>
        </div>

        {/* 主内容 */}
        <div className="ml-64 flex-1 p-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">客户留言管理</h1>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      姓名
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      电话
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      公司
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      需求
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      提交时间
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {messages.map((message) => (
                    <tr key={message.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {message.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {message.phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {message.company}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {message.demand}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(message.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDeleteMessage(message.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          删除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {messages.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                暂无客户留言
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 页脚 */}
      <footer className="bg-gray-800 text-white py-4 ml-64 fixed bottom-0 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>易云网络（侯客有道）团队 服务电话：13953631472</p>
        </div>
      </footer>
    </div>
  );
}