"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { generateAIContent } from '@/lib/aiClient';

export default function AIConfigPage() {
  const [aiGlobalEnabled, setAiGlobalEnabled] = useState<boolean>(false);
  const [testing, setTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<string>('');
  
  const router = useRouter();

  useEffect(() => {
    // 检查登录状态
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!isLoggedIn) {
      router.push('/admin');
    }

    // 从localStorage加载全局AI开关状态
    const saved = localStorage.getItem('ai_global_enabled');
    if (saved !== null) {
      setAiGlobalEnabled(JSON.parse(saved));
    }
  }, [router]);

  useEffect(() => {
    // 保存全局AI开关状态
    localStorage.setItem('ai_global_enabled', JSON.stringify(aiGlobalEnabled));
  }, [aiGlobalEnabled]);

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    router.push('/admin');
  };

  // 测试AI连通性
  const handleTestConnection = async () => {
    // 检查全局AI开关
    if (!aiGlobalEnabled) {
      alert('请先开启全局AI功能');
      return;
    }

    setTesting(true);
    setTestResult('');

    try {
      // 调用AI生成内容测试连通性
      const testPrompt = '测试AI连通性，返回"测试成功"';
      const result = await generateAIContent(testPrompt);
      
      if (result.includes('测试成功')) {
        setTestResult('AI连通性测试成功！');
      } else {
        setTestResult('AI连通性测试失败：返回内容不符合预期');
      }
    } catch (error) {
      console.error('AI测试失败:', error);
      setTestResult('AI连通性测试失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setTesting(false);
    }
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
                className="text-gray-700 hover:bg-blue-50 hover:text-blue-700 group flex items-center px-2 py-2 text-base font-medium rounded-md"
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
                className="bg-blue-50 text-blue-700 group flex items-center px-2 py-2 text-base font-medium rounded-md"
              >
                AI配置
              </a>
            </nav>
          </div>
        </div>

        {/* 主内容 */}
        <div className="ml-64 flex-1 p-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold text-gray-900">AI配置</h1>
            </div>
            
            {/* 全局AI开关 */}
            <div className="mb-6 p-4 border border-gray-200 rounded-md bg-gray-50">
              <h2 className="text-lg font-medium text-gray-900 mb-4">全局AI设置</h2>
              
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-medium text-gray-700">全局AI功能</h3>
                  <p className="text-sm text-gray-500">开启后所有模块的AI功能才能使用</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`text-sm font-medium ${aiGlobalEnabled ? 'text-green-600' : 'text-gray-500'}`}>
                    {aiGlobalEnabled ? '已开启' : '已关闭'}
                  </span>
                  <div className="relative inline-block w-12 align-middle select-none">
                    <input
                      type="checkbox"
                      id="aiGlobalEnabled"
                      className="toggle-checkbox"
                      checked={aiGlobalEnabled}
                      onChange={(e) => setAiGlobalEnabled(e.target.checked)}
                    />
                    <label
                      htmlFor="aiGlobalEnabled"
                      className={`toggle-label ${aiGlobalEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}
                    ></label>
                  </div>
                </div>
              </div>
              
              {/* 测试连通性 */}
              <div className="mb-4">
                <h3 className="font-medium text-gray-700 mb-2">测试AI连通性</h3>
                <p className="text-sm text-gray-500 mb-4">测试与AI服务的连接是否正常</p>
                <button
                  onClick={handleTestConnection}
                  disabled={testing || !aiGlobalEnabled}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {testing ? '测试中...' : '测试连通性'}
                </button>
              </div>
              
              {/* 测试结果 */}
              {testResult && (
                <div className={`mt-4 p-3 rounded-md ${testResult.includes('成功') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {testResult}
                </div>
              )}
            </div>
            
            {/* AI配置说明 */}
            <div className="p-4 border border-gray-200 rounded-md bg-gray-50">
              <h2 className="text-lg font-medium text-gray-900 mb-4">配置说明</h2>
              <div className="space-y-2 text-sm text-gray-600">
                <p>1. 全局AI开关控制所有模块的AI功能</p>
                <p>2. 每个模块还有独立的AI开关，可以单独控制</p>
                <p>3. 测试连通性可以验证AI服务是否正常</p>
                <p>4. AI功能需要正确配置环境变量才能使用</p>
              </div>
            </div>
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

// Tailwind CSS 自定义样式
const styles = `
  .toggle-checkbox:checked {
    right: 0;
    border-color: #3b82f6;
  }
  .toggle-label {
    position: relative;
    display: block;
    height: 24px;
    width: 48px;
    transition: background-color 0.3s ease;
  }
  .toggle-checkbox {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: 0;
    opacity: 0;
    cursor: pointer;
  }
  .toggle-label::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 20px;
    height: 20px;
    background-color: white;
    border-radius: 50%;
    transition: transform 0.3s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }
  .toggle-checkbox:checked + .toggle-label::after {
    transform: translateX(24px);
  }
`;

// 动态添加样式
if (typeof window !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}