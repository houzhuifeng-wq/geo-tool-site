"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { generateAIContent } from '@/lib/aiClient';

type QA = {
  id: string;
  question: string;
  answer: string;
  date: string;
  category: string;
  status?: 'published' | 'pending';
  [key: string]: any; // 保留其他字段
};

export default function QAManagementPage() {
  const [qas, setQAs] = useState<QA[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newQA, setNewQA] = useState<Partial<QA>>({
    question: '',
    answer: '',
    category: '',
  });
  const [activeTab, setActiveTab] = useState<'pending' | 'published'>('published');
  const [editingQA, setEditingQA] = useState<QA | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // AI配置状态
  const [aiEnabled, setAiEnabled] = useState<boolean>(false);
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [templates, setTemplates] = useState<string[]>([]);

  // 类型定义
  type TemplateArray = string[];
  const [randomTemplateEnabled, setRandomTemplateEnabled] = useState<boolean>(true);
  const [showAddTemplateModal, setShowAddTemplateModal] = useState(false);
  const [showEditTemplateModal, setShowEditTemplateModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  const [newTemplate, setNewTemplate] = useState<string>('');
  const [publishStrategy, setPublishStrategy] = useState<'auto' | 'manual'>('manual');
  
  // 发布设置状态
  const [manualEnabled, setManualEnabled] = useState<boolean>(true);
  const [scheduleEnabled, setScheduleEnabled] = useState<boolean>(false);
  const [scheduleTime, setScheduleTime] = useState<string>('08:00');
  const [randomEnabled, setRandomEnabled] = useState<boolean>(false);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [aiSuccess, setAiSuccess] = useState<boolean>(false);
  
  const router = useRouter();

  useEffect(() => {
    // 检查登录状态
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!isLoggedIn) {
      router.push('/admin');
    }

    // 从localStorage加载AI配置
    const savedAiEnabled = localStorage.getItem('qa_ai_enabled');
    if (savedAiEnabled !== null) {
      setAiEnabled(JSON.parse(savedAiEnabled));
    }

    const savedAiPrompt = localStorage.getItem('qa_ai_prompt');
    if (savedAiPrompt) {
      setAiPrompt(savedAiPrompt);
    }

    // 加载模板数组
    const savedTemplates = localStorage.getItem('qa_templates');
    if (savedTemplates) {
      setTemplates(JSON.parse(savedTemplates));
    } else {
      // 初始化默认模板
      const defaultTemplates = [
        "以问答形式写一篇 300 字内容：模拟一个 GEO 客户提问（如'我的网站为什么没有咨询？'），然后由专家回答。回答要口语化、去 AI 味，给出 2-3 条具体建议。文中自然出现'侯客有道GEO团队'和'服务热线：13953631472'。",
        "生成一篇 300 字的'常见误区'型问答：标题为'做 GEO 优化的 3 个常见误区'，以一问一答的方式写（问题短，回答详细）。回答中要融入'侯客有道GEO团队'和'服务热线：13953631472'。语气真实，像真实客户在请教。",
        "写一篇 300 字的'对比式'问答：问题例如'自己学 SEO 和找 GEO 团队哪个划算？'，回答中分析两者利弊，最后建议选择专业团队，并自然植入'侯客有道GEO团队'和'服务热线：13953631472'。"
      ];
      setTemplates(defaultTemplates);
      localStorage.setItem('qa_templates', JSON.stringify(defaultTemplates));
    }

    // 加载随机模板开关状态
    const savedRandomTemplateEnabled = localStorage.getItem('qa_random_template_enabled');
    if (savedRandomTemplateEnabled !== null) {
      setRandomTemplateEnabled(JSON.parse(savedRandomTemplateEnabled));
    }

    const savedPublishStrategy = localStorage.getItem('qa_publish_strategy');
    if (savedPublishStrategy === 'auto' || savedPublishStrategy === 'manual') {
      setPublishStrategy(savedPublishStrategy);
    }

    // 加载发布设置
    const savedManualEnabled = localStorage.getItem('qa_manual_enabled');
    if (savedManualEnabled !== null) {
      setManualEnabled(JSON.parse(savedManualEnabled));
    }
    const savedScheduleEnabled = localStorage.getItem('qa_schedule_enabled');
    if (savedScheduleEnabled !== null) {
      setScheduleEnabled(JSON.parse(savedScheduleEnabled));
    }
    const savedScheduleTime = localStorage.getItem('qa_schedule_time');
    if (savedScheduleTime) {
      setScheduleTime(savedScheduleTime);
    }
    const savedRandomEnabled = localStorage.getItem('qa_random_enabled');
    if (savedRandomEnabled !== null) {
      setRandomEnabled(JSON.parse(savedRandomEnabled));
    }

    // 从localStorage加载数据
    const savedQAs = localStorage.getItem('qaItems');
    if (savedQAs) {
      const parsedQAs = JSON.parse(savedQAs);
      // 为旧数据添加status字段
      const qasWithStatus = parsedQAs.map((qa: any) => ({
        ...qa,
        status: qa.status || 'published' // 默认已发布
      }));
      setQAs(qasWithStatus);
    } else {
      // 尝试从旧的qas key加载数据
      const oldSavedQAs = localStorage.getItem('qas');
      if (oldSavedQAs) {
        const parsedQAs = JSON.parse(oldSavedQAs);
        const qasWithStatus = parsedQAs.map((qa: any) => ({
          ...qa,
          status: 'published' // 默认已发布
        }));
        setQAs(qasWithStatus);
        // 保存到新的key
        localStorage.setItem('qaItems', JSON.stringify(qasWithStatus));
      }
    }
  }, [router]);

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

  // 保存AI配置
  useEffect(() => {
    localStorage.setItem('qa_ai_enabled', JSON.stringify(aiEnabled));
  }, [aiEnabled]);

  // 保存模板数组
  useEffect(() => {
    localStorage.setItem('qa_templates', JSON.stringify(templates));
  }, [templates]);

  // 保存随机模板开关状态
  useEffect(() => {
    localStorage.setItem('qa_random_template_enabled', JSON.stringify(randomTemplateEnabled));
  }, [randomTemplateEnabled]);

  // 添加模板
  const handleAddTemplate = () => {
    if (newTemplate.trim()) {
      setTemplates([...templates, newTemplate.trim()]);
      setNewTemplate('');
      setShowAddTemplateModal(false);
    }
  };

  // 编辑模板
  const handleEditTemplate = (index: number) => {
    setEditingIndex(index);
    setNewTemplate(templates[index]);
    setShowEditTemplateModal(true);
  };

  // 保存模板编辑
  const handleSaveTemplateEdit = () => {
    if (newTemplate.trim() && editingIndex >= 0) {
      const updatedTemplates = [...templates];
      updatedTemplates[editingIndex] = newTemplate.trim();
      setTemplates(updatedTemplates);
      setNewTemplate('');
      setEditingIndex(-1);
      setShowEditTemplateModal(false);
    }
  };

  // 删除模板
  const handleDeleteTemplate = (index: number) => {
    if (templates.length > 1) {
      setTemplates(templates.filter((_, i) => i !== index));
    }
  };

  // 获取当前使用的提示词
  const getCurrentPrompt = (): string => {
    if (randomTemplateEnabled) {
      // 如果启用随机模板且数组不为空，随机选择一个
      if (templates.length > 0) {
        const randomIndex = Math.floor(Math.random() * templates.length);
        return templates[randomIndex];
      } else {
        // 数组为空，回退到主提示词
        console.warn('模板数组为空，回退到主提示词');
      }
    }
    return aiPrompt;
  };

  useEffect(() => {
    localStorage.setItem('qa_ai_prompt', aiPrompt);
  }, [aiPrompt]);

  useEffect(() => {
    localStorage.setItem('qa_publish_strategy', publishStrategy);
  }, [publishStrategy]);

  // 保存发布设置
  useEffect(() => {
    localStorage.setItem('qa_manual_enabled', JSON.stringify(manualEnabled));
  }, [manualEnabled]);

  useEffect(() => {
    localStorage.setItem('qa_schedule_enabled', JSON.stringify(scheduleEnabled));
  }, [scheduleEnabled]);

  useEffect(() => {
    localStorage.setItem('qa_schedule_time', scheduleTime);
  }, [scheduleTime]);

  useEffect(() => {
    localStorage.setItem('qa_random_enabled', JSON.stringify(randomEnabled));
  }, [randomEnabled]);

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    router.push('/admin');
  };

  const handleAddQA = () => {
    if (newQA.question && newQA.answer && newQA.category) {
      const qa: QA = {
        id: Date.now().toString(),
        question: newQA.question!,
        answer: newQA.answer!,
        date: new Date().toISOString().split('T')[0],
        category: newQA.category!,
        status: 'published',
      };
      const updatedQAs = [...qas, qa];
      setQAs(updatedQAs);
      localStorage.setItem('qaItems', JSON.stringify(updatedQAs));
      setNewQA({ question: '', answer: '', category: '' });
      setShowAddForm(false);
    }
  };

  // 处理编辑问答
  const handleEditQA = (qa: QA) => {
    setEditingQA(qa);
    setShowEditModal(true);
  };

  // 保存编辑
  const handleSaveEdit = () => {
    if (editingQA) {
      const updatedQAs = qas.map(qa => 
        qa.id === editingQA.id ? editingQA : qa
      );
      setQAs(updatedQAs);
      localStorage.setItem('qaItems', JSON.stringify(updatedQAs));
      setShowEditModal(false);
      setEditingQA(null);
    }
  };

  // 处理发布问答
  const handlePublishQA = (id: string) => {
    const updatedQAs = qas.map(qa => 
      qa.id === id ? { ...qa, status: 'published' as const } : qa
    );
    setQAs(updatedQAs);
    localStorage.setItem('qaItems', JSON.stringify(updatedQAs));
  };

  // 处理下架问答
  const handleUnpublishQA = (id: string) => {
    const updatedQAs = qas.map(qa => 
      qa.id === id ? { ...qa, status: 'pending' as const } : qa
    );
    setQAs(updatedQAs);
    localStorage.setItem('qaItems', JSON.stringify(updatedQAs));
  };

  // 处理AI生成问答
  const handleGenerateQA = async () => {
    // 检查全局AI开关
    const globalAiEnabled = localStorage.getItem('ai_global_enabled');
    if (!globalAiEnabled || JSON.parse(globalAiEnabled) === false) {
      alert('全局AI功能已关闭，请前往AI配置页开启');
      return;
    }

    if (!aiEnabled) {
      alert('请先开启本模块AI功能');
      return;
    }

    // 检查今天是否已经生成过
    const today = new Date().toISOString().split('T')[0];
    const lastGenerateDate = localStorage.getItem('qa_last_generate_date');
    
    if (lastGenerateDate === today) {
      if (!confirm('今天已经生成过问答，是否覆盖？')) {
        return;
      }
    }

    setLoading(true);
    setAiSuccess(false);

    try {
      // 获取当前使用的提示词
      const prompt = getCurrentPrompt();
      
      // 调用AI生成内容
      const aiContent = await generateAIContent(prompt);
      
      // 提取问题和回答
      const lines = aiContent.split('\n');
      let question = lines[0].replace(/^#\s*/, '');
      let answer = lines.slice(1).join('\n').trim();
      
      // 如果没有问题，使用默认问题
      if (!question) {
        question = `关于GEO优化的问题 - ${today}`;
      }
      
      // 创建新问答
      const newQA: QA = {
        id: Date.now().toString(),
        question,
        answer,
        date: today,
        category: '常见问题',
        status: publishStrategy === 'auto' ? 'published' : 'pending',
      };
      
      // 添加到列表
      const updatedQAs = [...qas, newQA];
      setQAs(updatedQAs);
      localStorage.setItem('qaItems', JSON.stringify(updatedQAs));
      
      // 更新最后生成日期
      localStorage.setItem('qa_last_generate_date', today);
      
      setAiSuccess(true);
      setTimeout(() => setAiSuccess(false), 3000);
      
      // 如果是待审核状态，切换到待审核标签
      if (publishStrategy === 'manual') {
        setActiveTab('pending');
      }
    } catch (error) {
      console.error('AI生成失败:', error);
      alert('AI生成失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQA = (id: string) => {
    const updatedQAs = qas.filter(qa => qa.id !== id);
    setQAs(updatedQAs);
    localStorage.setItem('qaItems', JSON.stringify(updatedQAs));
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
                案例管理
              </a>
              <a
                href="/admin/qa"
                className="bg-blue-50 text-blue-700 group flex items-center px-2 py-2 text-base font-medium rounded-md"
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
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold text-gray-900">问答管理</h1>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                {showAddForm ? '取消' : '添加问答'}
              </button>
            </div>
            
            {/* AI内容生成模块 */}
            <div className="mb-6 p-4 border border-gray-200 rounded-md bg-gray-50">
              <h2 className="text-lg font-medium text-gray-900 mb-4">AI内容生成</h2>
              
              {/* AI功能开关 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">AI生成功能</label>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">开启AI生成功能</span>
                  <button
                    onClick={() => setAiEnabled(!aiEnabled)}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${aiEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${aiEnabled ? 'translate-x-7' : 'translate-x-1'}`}
                    ></span>
                  </button>
                </div>
              </div>
              
              {/* 提示词设置 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">固定提示词（最多2000个字符，关闭随机模板时使用）</label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  rows={4}
                  maxLength={2000}
                />
              </div>
              
              {/* 启用随机模板开关 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">启用随机模板</label>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">从模板库中随机选择提示词</span>
                  <button
                    onClick={() => setRandomTemplateEnabled(!randomTemplateEnabled)}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${randomTemplateEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${randomTemplateEnabled ? 'translate-x-7' : 'translate-x-1'}`}
                    ></span>
                  </button>
                </div>
              </div>
              
              {/* 内容风格模板库 */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">内容风格模板库（随机选择）</label>
                  <button
                    onClick={() => setShowAddTemplateModal(true)}
                    className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                  >
                    + 添加新模板
                  </button>
                </div>
                <div className="border border-gray-300 rounded-md">
                  {templates.map((template, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
                      <span className="text-sm text-gray-700 flex-1 pr-4">
                        {template.length > 50 ? template.substring(0, 50) + '...' : template}
                      </span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditTemplate(index)}
                          className="text-blue-600 hover:text-blue-900 text-sm"
                        >
                          编辑
                        </button>
                        <button
                          onClick={() => handleDeleteTemplate(index)}
                          className="text-red-600 hover:text-red-900 text-sm"
                          disabled={templates.length <= 1}
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* 生成按钮 */}
              <button
                onClick={handleGenerateQA}
                disabled={loading || !aiEnabled || (!randomTemplateEnabled && !aiPrompt.trim())}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '生成中...' : '一键生成今日问答'}
              </button>
              {!randomTemplateEnabled && !aiPrompt.trim() && (
                <p className="mt-2 text-red-600 text-sm">请先填写固定提示词</p>
              )}
              
              {/* 生成成功提示 */}
              {aiSuccess && (
                <div className="mt-2 text-green-600 text-sm">
                  问答生成成功！
                </div>
              )}
            </div>
            
            {/* 发布设置模块 */}
            <div className="mb-6 p-4 border border-gray-200 rounded-md bg-gray-50">
              <h2 className="text-lg font-medium text-gray-900 mb-4">发布设置</h2>
              
              {/* 人工审核发布 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">人工审核发布</label>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">人工审核后发布</span>
                  <button
                    onClick={() => {
                      setManualEnabled(true);
                      setScheduleEnabled(false);
                      setRandomEnabled(false);
                    }}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${manualEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${manualEnabled ? 'translate-x-7' : 'translate-x-1'}`}
                    ></span>
                  </button>
                </div>
              </div>
              
              {/* 定时发布 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">定时发布</label>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">开启定时发布</span>
                  <button
                    onClick={() => {
                      setScheduleEnabled(true);
                      setManualEnabled(false);
                      setRandomEnabled(false);
                    }}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${scheduleEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${scheduleEnabled ? 'translate-x-7' : 'translate-x-1'}`}
                    ></span>
                  </button>
                </div>
              </div>
              
              {scheduleEnabled && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">定时发布时间</label>
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              )}
              
              {/* 随机发布 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">随机发布</label>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">开启随机发布</span>
                  <button
                    onClick={() => {
                      setRandomEnabled(true);
                      setManualEnabled(false);
                      setScheduleEnabled(false);
                    }}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${randomEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${randomEnabled ? 'translate-x-7' : 'translate-x-1'}`}
                    ></span>
                  </button>
                </div>
              </div>
            </div>
            
            {/* 添加表单 */}
            {showAddForm && (
              <div className="mb-6 p-4 border border-gray-200 rounded-md">
                <h2 className="text-lg font-medium text-gray-900 mb-4">添加新问答</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">问题</label>
                    <input
                      type="text"
                      value={newQA.question}
                      onChange={(e) => setNewQA({ ...newQA, question: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">回答</label>
                    <textarea
                      value={newQA.answer}
                      onChange={(e) => setNewQA({ ...newQA, answer: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                      rows={4}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
                    <input
                      type="text"
                      value={newQA.category}
                      onChange={(e) => setNewQA({ ...newQA, category: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <button
                    onClick={handleAddQA}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    保存
                  </button>
                </div>
              </div>
            )}
            
            {/* 标签页 */}
            <div className="mb-4 border-b border-gray-200">
              <div className="flex space-x-8">
                {/* 只有人工审核发布时显示待审核标签 */}
                {manualEnabled && (
                  <button
                    onClick={() => setActiveTab('pending')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'pending' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                  >
                    待审核
                  </button>
                )}
                <button
                  onClick={() => setActiveTab('published')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'published' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  已发布
                </button>
              </div>
            </div>
            
            {/* 问答列表 */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      问题
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      分类
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      日期
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {qas
                    .filter(qa => qa.status === activeTab)
                    .map((qa) => (
                      <tr key={qa.id}>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {qa.question}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {qa.category}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {qa.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleEditQA(qa)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            编辑
                          </button>
                          {activeTab === 'pending' ? (
                            <button
                              onClick={() => handlePublishQA(qa.id)}
                              className="text-green-600 hover:text-green-900 mr-3"
                            >
                              发布
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUnpublishQA(qa.id)}
                              className="text-yellow-600 hover:text-yellow-900 mr-3"
                            >
                              下架
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteQA(qa.id)}
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
            
            {qas.filter(qa => qa.status === activeTab).length === 0 && (
              <div className="text-center py-12 text-gray-500">
                {activeTab === 'pending' ? '暂无待审核问答' : '暂无已发布问答'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 编辑弹窗 */}
      {showEditModal && editingQA && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">编辑问答</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">问题</label>
                <input
                  type="text"
                  value={editingQA.question}
                  onChange={(e) => setEditingQA({ ...editingQA, question: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">回答</label>
                <textarea
                  value={editingQA.answer}
                  onChange={(e) => setEditingQA({ ...editingQA, answer: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
                <input
                  type="text"
                  value={editingQA.category}
                  onChange={(e) => setEditingQA({ ...editingQA, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-medium"
                >
                  保存
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-md font-medium"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 添加模板弹窗 */}
      {showAddTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">添加新模板</h3>
              <button
                onClick={() => {
                  setShowAddTemplateModal(false);
                  setNewTemplate('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">模板内容（最多2000个字符）</label>
                <textarea
                  value={newTemplate}
                  onChange={(e) => setNewTemplate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  rows={6}
                  maxLength={2000}
                  placeholder="请输入模板内容..."
                />
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={handleAddTemplate}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-medium"
                >
                  添加
                </button>
                <button
                  onClick={() => {
                    setShowAddTemplateModal(false);
                    setNewTemplate('');
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-md font-medium"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 编辑模板弹窗 */}
      {showEditTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">编辑模板</h3>
              <button
                onClick={() => {
                  setShowEditTemplateModal(false);
                  setEditingIndex(-1);
                  setNewTemplate('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">模板内容（最多2000个字符）</label>
                <textarea
                  value={newTemplate}
                  onChange={(e) => setNewTemplate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  rows={6}
                  maxLength={2000}
                />
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={handleSaveTemplateEdit}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-medium"
                >
                  保存
                </button>
                <button
                  onClick={() => {
                    setShowEditTemplateModal(false);
                    setEditingIndex(-1);
                    setNewTemplate('');
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-md font-medium"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 页脚 */}
      <footer className="bg-gray-800 text-white py-4 ml-64 fixed bottom-0 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>易云网络（侯客有道）团队 服务电话：13953631472</p>
        </div>
      </footer>
    </div>
  );
}