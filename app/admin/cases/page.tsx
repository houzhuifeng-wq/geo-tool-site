"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { generateAIContent } from '@/lib/aiClient';
import { checkDuplicate, isDuplicateCheckEnabled } from '@/lib/duplicateChecker';

type Case = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  category: string;
  status?: 'published' | 'pending';
  similarTitles?: string[];
  [key: string]: any; // 保留其他字段
};

export default function CasesManagementPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [duplicateWarning, setDuplicateWarning] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCase, setNewCase] = useState<Partial<Case>>({
    title: '',
    excerpt: '',
    content: '',
    category: '',
  });
  const [activeTab, setActiveTab] = useState<'pending' | 'published'>('published');
  const [editingCase, setEditingCase] = useState<Case | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSimilarModal, setShowSimilarModal] = useState(false);
  const [currentSimilarCase, setCurrentSimilarCase] = useState<Case | null>(null);
  
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
  const [dailyLimit, setDailyLimit] = useState<number>(1);
  
  const [loading, setLoading] = useState<boolean>(false);

  // 在客户端挂载后读取localStorage中的loading状态
  // 但如果页面重新加载，之前的请求肯定已经中断，所以重置为false
  useEffect(() => {
    // 页面加载时重置loading状态（之前的请求已经中断）
    localStorage.setItem('cases_loading', 'false');
    setLoading(false);
  }, []);
  const [aiSuccess, setAiSuccess] = useState<boolean>(false);
  
  const router = useRouter();

  useEffect(() => {
    // 检查登录状态
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!isLoggedIn) {
      router.push('/admin');
    }

    // 从localStorage加载AI配置
    const savedAiEnabled = localStorage.getItem('cases_ai_enabled');
    if (savedAiEnabled !== null) {
      setAiEnabled(JSON.parse(savedAiEnabled));
    }

    const savedAiPrompt = localStorage.getItem('cases_ai_prompt');
    if (savedAiPrompt) {
      setAiPrompt(savedAiPrompt);
    }

    // 加载模板数组
    const savedTemplates = localStorage.getItem('cases_templates');
    if (savedTemplates) {
      setTemplates(JSON.parse(savedTemplates));
    } else {
      // 如果没有保存的模板，初始化默认模板
      const defaultTemplates = [
        '自选一个行业（如制造、服务、电商等），创建一个GEO优化成功案例。描述客户痛点、解决方案和最终效果。合理置入：侠客有道GEO团队，服务热线：13953631472。字数控制在600-800字。',
        '撰写一个真实场景的网站检测案例分析。包含检测过程、发现的问题、优化方案和改进结果。合理置入：侠客有道GEO团队，服务热线：13953631472。字数控制在600-800字。',
        '创作一个本地搜索优化的成功案例。展示客户从排名落后到名列前茅的完整过程。合理置入：侠客有道GEO团队，服务热线：13953631472。字数控制在600-800字。'
      ];
      setTemplates(defaultTemplates);
      localStorage.setItem('cases_templates', JSON.stringify(defaultTemplates));
    }

    // 加载随机模板开关状态
    const savedRandomTemplateEnabled = localStorage.getItem('cases_random_template_enabled');
    if (savedRandomTemplateEnabled !== null) {
      setRandomTemplateEnabled(JSON.parse(savedRandomTemplateEnabled));
    }

    const savedPublishStrategy = localStorage.getItem('cases_publish_strategy');
    if (savedPublishStrategy === 'auto' || savedPublishStrategy === 'manual') {
      setPublishStrategy(savedPublishStrategy);
    }

    // 加载发布设置
    const savedManualEnabled = localStorage.getItem('cases_manual_enabled');
    if (savedManualEnabled !== null) {
      setManualEnabled(JSON.parse(savedManualEnabled));
    }
    const savedScheduleEnabled = localStorage.getItem('cases_schedule_enabled');
    if (savedScheduleEnabled !== null) {
      setScheduleEnabled(JSON.parse(savedScheduleEnabled));
    }
    const savedScheduleTime = localStorage.getItem('cases_schedule_time');
    if (savedScheduleTime) {
      setScheduleTime(savedScheduleTime);
    }
    const savedRandomEnabled = localStorage.getItem('cases_random_enabled');
    if (savedRandomEnabled !== null) {
      setRandomEnabled(JSON.parse(savedRandomEnabled));
    }

    // 从localStorage加载数据
    const savedCases = localStorage.getItem('caseStudies');
    if (savedCases) {
      const parsedCases = JSON.parse(savedCases);
      // 为旧数据添加status字段
      const casesWithStatus = parsedCases.map((caseItem: any) => ({
        ...caseItem,
        status: caseItem.status || 'published' // 默认已发布
      }));
      // 按发布时间排序，最新的在最前面
      // 优先使用publishedAt，否则使用date字段
      casesWithStatus.sort((a: { publishedAt?: string; date: string }, b: { publishedAt?: string; date: string }) => {
        const dateA = a.publishedAt ? new Date(a.publishedAt) : new Date(a.date);
        const dateB = b.publishedAt ? new Date(b.publishedAt) : new Date(b.date);
        return dateB.getTime() - dateA.getTime();
      });
      setCases(casesWithStatus);
    } else {
      // 尝试从旧的cases key加载数据
      const oldSavedCases = localStorage.getItem('cases');
      if (oldSavedCases) {
        const parsedCases = JSON.parse(oldSavedCases);
        const casesWithStatus = parsedCases.map((caseItem: any) => ({
          ...caseItem,
          status: 'published' // 默认已发布
        }));
        // 按发布时间排序，最新的在最前面
        // 优先使用publishedAt，否则使用date字段
        casesWithStatus.sort((a, b) => {
          const dateA = a.publishedAt ? new Date(a.publishedAt) : new Date(a.date);
          const dateB = b.publishedAt ? new Date(b.publishedAt) : new Date(b.date);
          return dateB.getTime() - dateA.getTime();
        });
        setCases(casesWithStatus);
        // 保存到新的key
        localStorage.setItem('caseStudies', JSON.stringify(casesWithStatus));
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
    localStorage.setItem('cases_ai_enabled', JSON.stringify(aiEnabled));
  }, [aiEnabled]);

  // 保存模板数组
  useEffect(() => {
    localStorage.setItem('cases_templates', JSON.stringify(templates));
  }, [templates]);

  // 保存随机模板开关状态
  useEffect(() => {
    localStorage.setItem('cases_random_template_enabled', JSON.stringify(randomTemplateEnabled));
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
    localStorage.setItem('cases_ai_prompt', aiPrompt);
  }, [aiPrompt]);

  useEffect(() => {
    localStorage.setItem('cases_publish_strategy', publishStrategy);
  }, [publishStrategy]);

  // 保存发布设置
  useEffect(() => {
    localStorage.setItem('cases_manual_enabled', JSON.stringify(manualEnabled));
  }, [manualEnabled]);

  useEffect(() => {
    localStorage.setItem('cases_schedule_enabled', JSON.stringify(scheduleEnabled));
  }, [scheduleEnabled]);

  useEffect(() => {
    localStorage.setItem('cases_schedule_time', scheduleTime);
  }, [scheduleTime]);

  useEffect(() => {
    localStorage.setItem('cases_random_enabled', JSON.stringify(randomEnabled));
  }, [randomEnabled]);

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    router.push('/admin');
  };

  const handleAddCase = () => {
    if (newCase.title && newCase.excerpt && newCase.content && newCase.category) {
      const caseItem: Case = {
        id: Date.now().toString(),
        title: newCase.title!,
        excerpt: newCase.excerpt!,
        content: newCase.content!,
        date: new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
        category: newCase.category!,
        status: 'published',
      };
      // 添加到列表开头（最新的在最前面）
      const updatedCases = [caseItem, ...cases];
      setCases(updatedCases);
      localStorage.setItem('caseStudies', JSON.stringify(updatedCases));
      setNewCase({ title: '', excerpt: '', content: '', category: '' });
      setShowAddForm(false);
    }
  };

  // 处理编辑案例
  const handleEditCase = (caseItem: Case) => {
    setEditingCase(caseItem);
    setShowEditModal(true);
  };

  // 保存编辑
  const handleSaveEdit = () => {
    if (editingCase) {
      const updatedCases = cases.map(caseItem => 
        caseItem.id === editingCase.id ? editingCase : caseItem
      );
      setCases(updatedCases);
      localStorage.setItem('caseStudies', JSON.stringify(updatedCases));
      setShowEditModal(false);
      setEditingCase(null);
    }
  };

  // 处理发布案例
  const handlePublishCase = (id: string) => {
    const updatedCases = cases.map(caseItem => 
      caseItem.id === id ? { ...caseItem, status: 'published' as const } : caseItem
    );
    setCases(updatedCases);
    localStorage.setItem('caseStudies', JSON.stringify(updatedCases));
  };

  // 强制发布（跳过查重）
  const handleForcePublishCase = (id: string) => {
    const updatedCases = cases.map(caseItem => 
      caseItem.id === id ? { ...caseItem, status: 'published' as const, similarTitles: undefined } : caseItem
    );
    setCases(updatedCases);
    localStorage.setItem('caseStudies', JSON.stringify(updatedCases));
  };

  // 处理查看相似内容
  const handleViewSimilarCase = (caseItem: Case) => {
    setCurrentSimilarCase(caseItem);
    setShowSimilarModal(true);
  };

  // 处理下架案例
  const handleUnpublishCase = (id: string) => {
    const updatedCases = cases.map(caseItem => 
      caseItem.id === id ? { ...caseItem, status: 'pending' as const } : caseItem
    );
    setCases(updatedCases);
    localStorage.setItem('caseStudies', JSON.stringify(updatedCases));
  };

  // 处理AI生成案例
  const handleGenerateCase = async () => {
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
    const lastGenerateDate = localStorage.getItem('cases_last_generate_date');
    
    // 保存当前状态到闭包，确保生成过程不受后续操作影响
    const currentAiEnabled = aiEnabled;
    const currentRandomTemplateEnabled = randomTemplateEnabled;
    const currentAiPrompt = aiPrompt;
    const currentTemplates = [...templates];
    const currentPublishStrategy = manualEnabled ? 'manual' : 'auto';
    const currentToday = new Date().toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    
    setLoading(true);
    localStorage.setItem('cases_loading', 'true');
    setAiSuccess(false);

    try {
      // 使用闭包中的状态获取提示词，不受后续操作影响
      const getPrompt = () => {
        if (currentRandomTemplateEnabled && currentTemplates.length > 0) {
          const randomIndex = Math.floor(Math.random() * currentTemplates.length);
          return currentTemplates[randomIndex];
        }
        return currentAiPrompt;
      };
      
      const prompt = getPrompt();
      
      // 调用AI生成内容
      const aiContent = await generateAIContent(prompt);
      
      // 提取标题和内容
      const lines = aiContent.split('\n');
      let title = lines[0].replace(/^#{1,3}\s*/, '').replace(/^[\d.\-*]+\s*/, '').trim();
      let content = lines.slice(1).join('\n').trim();
      
      // 如果标题看起来是模板标记，尝试从内容中提取
      if (!title || title.length < 5) {
        // 尝试找第一个非空行作为标题
        for (const line of lines) {
          const cleanLine = line.replace(/^#{1,3}\s*/, '').replace(/^[\d.\-*]+\s*/, '').trim();
          if (cleanLine && cleanLine.length >= 5) {
            title = cleanLine;
            content = aiContent.substring(aiContent.indexOf(line) + line.length).trim();
            break;
          }
        }
      }
      
      // 如果仍然没有标题，使用默认标题
      if (!title || title.length < 5) {
        title = `潍坊市企业GEO方案展示 - ${today}`;
      }
      
      // 清理内容末尾的字数说明（如"全文400字"、"约428字"等）
      content = content.replace(/\s*(全文|共计|共|约)?\s*\d+\s*字\s*$/i, '').trim();
      // 清理内容中间的字数说明
      content = content.replace(/\s*(全文|共计|共|约)\s*\d+\s*字\s*/gi, '').trim();
      
      // 生成摘要
      const excerpt = content.substring(0, 100) + '...';
      
      // 查重检查
      let finalStatus = currentPublishStrategy === 'auto' ? 'published' : 'pending';
      let duplicateWarningMsg = '';
      const similarTitles: string[] = [];
      
      if (isDuplicateCheckEnabled()) {
        const result = checkDuplicate('cases', title, content);
        if (result.isDuplicate) {
          finalStatus = 'pending';
          duplicateWarningMsg = `${title} 与已有内容高度相似，已移至待审核，请人工检查。`;
          similarTitles.push(...result.similarTitles);
        }
      }
      
      // 创建新案例
      const newCaseItem: Case = {
        id: Date.now().toString(),
        title,
        excerpt,
        content,
        date: currentToday,
        category: '企业方案',
        status: finalStatus,
        similarTitles: similarTitles.length > 0 ? similarTitles : undefined,
      };
      
      // 添加到列表开头（最新的在最前面）
      const updatedCases = [newCaseItem, ...cases];
      setCases(updatedCases);
      localStorage.setItem('caseStudies', JSON.stringify(updatedCases));
      
      // 更新最后生成日期
      localStorage.setItem('cases_last_generate_date', today);
      
      setAiSuccess(true);
      setTimeout(() => setAiSuccess(false), 3000);
      
      // 显示重复警告
      if (duplicateWarningMsg) {
        setDuplicateWarning(duplicateWarningMsg);
        setTimeout(() => setDuplicateWarning(''), 5000);
      }
      
      // 如果是待审核状态，切换到待审核标签
      if (publishStrategy === 'manual') {
        setActiveTab('pending');
      }
    } catch (error) {
      console.error('AI生成失败:', error);
      alert('AI生成失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
        setLoading(false);
        localStorage.setItem('cases_loading', 'false');
      }
  };

  const handleDeleteCase = (id: string) => {
    const updatedCases = cases.filter(caseItem => caseItem.id !== id);
    setCases(updatedCases);
    localStorage.setItem('caseStudies', JSON.stringify(updatedCases));
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
                className="bg-blue-50 text-blue-700 group flex items-center px-2 py-2 text-base font-medium rounded-md"
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
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold text-gray-900">方案管理</h1>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                {showAddForm ? '取消' : '添加方案'}
              </button>
            </div>
            
            {/* 重复警告提示 */}
            {duplicateWarning && (
              <div className="mb-6 p-4 border border-red-200 rounded-md bg-red-50">
                <p className="text-red-700">{duplicateWarning}</p>
              </div>
            )}
            
            {/* AI内容生成和发布设置模块 */}
            <div className="mb-6 p-4 border border-gray-200 rounded-md bg-gray-50">
              <h2 className="text-lg font-medium text-gray-900 mb-4">AI内容生成</h2>
              
              {/* AI功能开关 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">AI生成功能</label>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">开启AI生成功能</span>
                  <button
                    onClick={() => setAiEnabled(!aiEnabled)}
                    disabled={loading}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${aiEnabled ? 'bg-blue-600' : 'bg-gray-300'} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${aiEnabled ? 'translate-x-7' : 'translate-x-1'}`}
                    ></span>
                  </button>
                </div>
              </div>
              
              {/* 提示词设置 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">固定提示词（关闭随机模板时使用）</label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  rows={4}
                />
              </div>
              
              {/* 启用随机模板开关 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">启用随机模板</label>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">从模板库中随机选择提示词</span>
                  <button
                    onClick={() => setRandomTemplateEnabled(!randomTemplateEnabled)}
                    disabled={loading}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${randomTemplateEnabled ? 'bg-blue-600' : 'bg-gray-300'} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                  disabled={loading}
                  className="text-blue-600 hover:text-blue-900 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
                      disabled={loading}
                      className="text-blue-600 hover:text-blue-900 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDeleteTemplate(index)}
                      disabled={loading || templates.length <= 1}
                      className="text-red-600 hover:text-red-900 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
                onClick={handleGenerateCase}
                disabled={loading || !aiEnabled || (!randomTemplateEnabled && !aiPrompt.trim()) || (randomTemplateEnabled && templates.length === 0)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '生成中...' : '一键生成今日方案'}
              </button>
              {!randomTemplateEnabled && !aiPrompt.trim() && (
                <p className="mt-2 text-red-600 text-sm">请先填写固定提示词</p>
              )}
              
              {/* 生成成功提示 */}
              {aiSuccess && (
                <div className="mt-2 text-green-600 text-sm">
                  方案生成成功！
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
                    disabled={loading}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${manualEnabled ? 'bg-blue-600' : 'bg-gray-300'} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                    disabled={loading}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${scheduleEnabled ? 'bg-blue-600' : 'bg-gray-300'} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
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
              
              {/* 每日发布数量 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">每日发布数量</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  step="1"
                  value={dailyLimit}
                  onChange={(e) => setDailyLimit(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  placeholder="输入每日发布数量"
                />
              </div>
            </div>
            
            {/* 添加表单 */}
            {showAddForm && (
              <div className="mb-6 p-4 border border-gray-200 rounded-md">
                <h2 className="text-lg font-medium text-gray-900 mb-4">添加新方案</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">标题</label>
                    <input
                      type="text"
                      value={newCase.title}
                      onChange={(e) => setNewCase({ ...newCase, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">摘要</label>
                    <input
                      type="text"
                      value={newCase.excerpt}
                      onChange={(e) => setNewCase({ ...newCase, excerpt: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">内容</label>
                    <textarea
                      value={newCase.content}
                      onChange={(e) => setNewCase({ ...newCase, content: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                      rows={4}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
                    <input
                      type="text"
                      value={newCase.category}
                      onChange={(e) => setNewCase({ ...newCase, category: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <button
                    onClick={handleAddCase}
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
                <button
                  onClick={() => setActiveTab('pending')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'pending' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  待审核
                </button>
                <button
                  onClick={() => setActiveTab('published')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'published' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  已发布
                </button>
              </div>
            </div>
            
            {/* 方案列表 */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      标题
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
                  {cases
                    .filter(caseItem => caseItem.status === activeTab)
                    .map((caseItem) => (
                      <tr key={caseItem.id}>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {caseItem.title}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {caseItem.category}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {caseItem.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleEditCase(caseItem)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            编辑
                          </button>
                          {activeTab === 'pending' ? (
                            <>
                              <button
                                onClick={() => handlePublishCase(caseItem.id)}
                                className="text-green-600 hover:text-green-900 mr-3"
                              >
                                发布
                              </button>
                              <button
                                onClick={() => handleForcePublishCase(caseItem.id)}
                                className="text-purple-600 hover:text-purple-900 mr-3"
                              >
                                强制发布
                              </button>
                              {caseItem.similarTitles && caseItem.similarTitles.length > 0 && (
                                <button
                                  onClick={() => handleViewSimilarCase(caseItem)}
                                  className="text-orange-600 hover:text-orange-900 mr-3"
                                >
                                  查看相似
                                </button>
                              )}
                            </>
                          ) : (
                            <button
                              onClick={() => handleUnpublishCase(caseItem.id)}
                              className="text-yellow-600 hover:text-yellow-900 mr-3"
                            >
                              下架
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteCase(caseItem.id)}
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
            
            {cases.filter(caseItem => caseItem.status === activeTab).length === 0 && (
              <div className="text-center py-12 text-gray-500">
                {activeTab === 'pending' ? '暂无待审核方案' : '暂无已发布方案'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 编辑弹窗 */}
      {showEditModal && editingCase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">编辑方案</h3>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">标题</label>
                <input
                  type="text"
                  value={editingCase.title}
                  onChange={(e) => setEditingCase({ ...editingCase, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">摘要</label>
                <input
                  type="text"
                  value={editingCase.excerpt}
                  onChange={(e) => setEditingCase({ ...editingCase, excerpt: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">内容</label>
                <textarea
                  value={editingCase.content}
                  onChange={(e) => setEditingCase({ ...editingCase, content: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
                <input
                  type="text"
                  value={editingCase.category}
                  onChange={(e) => setEditingCase({ ...editingCase, category: e.target.value })}
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

      {/* 查看相似内容弹窗 */}
      {showSimilarModal && currentSimilarCase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">相似内容</h3>
              <button
                onClick={() => setShowSimilarModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">当前方案标题</label>
                <p className="text-gray-900">{currentSimilarCase.title}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">相似方案标题</label>
                <ul className="border border-gray-300 rounded-md p-2">
                  {currentSimilarCase.similarTitles?.map((title, index) => (
                    <li key={index} className="text-sm text-red-600 py-1">• {title}</li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => setShowSimilarModal(false)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-medium"
              >
                关闭
              </button>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">模板内容</label>
                <textarea
                  value={newTemplate}
                  onChange={(e) => setNewTemplate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  rows={6}
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