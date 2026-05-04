"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 板块类型
type Section = 'blog' | 'qa' | 'cases';

// 发布设置类型
interface PublishSettings {
  section: Section;
  dailyLimit: number;
  scheduleEnabled: boolean;
  scheduleTime: string;
  randomEnabled: boolean;
}

// API 返回的发布设置项类型
interface PublishSettingItem {
  section: 'blog' | 'qa' | 'cases';
  dailyLimit?: number;
  scheduleEnabled?: boolean;
  scheduleTime?: string;
  randomEnabled?: boolean;
}

export default function PublishSettingsPage() {
  const [settings, setSettings] = useState<Record<Section, PublishSettings>>({
    blog: { section: 'blog', dailyLimit: 1, scheduleEnabled: false, scheduleTime: '08:00', randomEnabled: false },
    qa: { section: 'qa', dailyLimit: 1, scheduleEnabled: false, scheduleTime: '08:00', randomEnabled: false },
    cases: { section: 'cases', dailyLimit: 1, scheduleEnabled: false, scheduleTime: '08:00', randomEnabled: false }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string>('');
  
  const router = useRouter();

  useEffect(() => {
    // 检查登录状态
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!isLoggedIn) {
      router.push('/admin');
    }

    // 获取发布设置
    fetchSettings();
  }, [router]);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/publish-settings');
      if (response.ok) {
        const data = await response.json();
        const newSettings: Record<Section, PublishSettings> = {
          blog: { section: 'blog', dailyLimit: 1, scheduleEnabled: false, scheduleTime: '08:00', randomEnabled: false },
          qa: { section: 'qa', dailyLimit: 1, scheduleEnabled: false, scheduleTime: '08:00', randomEnabled: false },
          cases: { section: 'cases', dailyLimit: 1, scheduleEnabled: false, scheduleTime: '08:00', randomEnabled: false }
        };
        
        data.forEach((item: PublishSettingItem) => {
          if (newSettings[item.section]) {
            newSettings[item.section] = {
              ...newSettings[item.section],
              dailyLimit: item.dailyLimit || 1,
              scheduleEnabled: item.scheduleEnabled || false,
              scheduleTime: item.scheduleTime || '08:00',
              randomEnabled: item.randomEnabled || false
            };
          }
        });
        
        setSettings(newSettings);
      }
    } catch (error) {
      console.error('获取发布设置失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDailyLimitChange = (section: Section, value: string) => {
    const dailyLimit = parseInt(value) || 1;
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        dailyLimit
      }
    }));
  };

  const handleScheduleEnabledChange = (section: Section, enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        scheduleEnabled: enabled
      }
    }));
  };

  const handleScheduleTimeChange = (section: Section, time: string) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        scheduleTime: time
      }
    }));
  };

  const handleRandomEnabledChange = (section: Section, enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        randomEnabled: enabled
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      for (const section of Object.keys(settings) as Section[]) {
        const response = await fetch('/api/admin/publish-settings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(settings[section])
        });

        if (!response.ok) {
          throw new Error('保存设置失败');
        }
      }

      setMessage('所有设置保存成功！');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('保存设置失败:', error);
      setMessage('保存设置失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  // 白名单管理
  const [whitelistDomains, setWhitelistDomains] = useState<string[]>([]);
  const [newDomain, setNewDomain] = useState('');
  const [whitelistMessage, setWhitelistMessage] = useState('');

  useEffect(() => {
    const savedDomains = localStorage.getItem('geoWhitelist');
    if (savedDomains) {
      setWhitelistDomains(JSON.parse(savedDomains));
    } else {
      const defaultDomains = ['www.your-site.com', 'your-success-site.com'];
      setWhitelistDomains(defaultDomains);
      localStorage.setItem('geoWhitelist', JSON.stringify(defaultDomains));
    }
  }, []);

  const handleAddWhitelistDomain = () => {
    if (!newDomain.trim()) {
      setWhitelistMessage('请输入域名');
      return;
    }
    if (whitelistDomains.includes(newDomain.trim())) {
      setWhitelistMessage('域名已存在');
      return;
    }
    const updatedDomains = [...whitelistDomains, newDomain.trim()];
    setWhitelistDomains(updatedDomains);
    localStorage.setItem('geoWhitelist', JSON.stringify(updatedDomains));
    setNewDomain('');
    setWhitelistMessage('域名添加成功！');
    setTimeout(() => setWhitelistMessage(''), 3000);
  };

  const handleRemoveWhitelistDomain = (domain: string) => {
    const updatedDomains = whitelistDomains.filter(d => d !== domain);
    setWhitelistDomains(updatedDomains);
    localStorage.setItem('geoWhitelist', JSON.stringify(updatedDomains));
    setWhitelistMessage('域名已删除');
    setTimeout(() => setWhitelistMessage(''), 3000);
  };

  const handleSaveSection = async (section: Section) => {
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/publish-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings[section])
      });

      if (!response.ok) {
        throw new Error('保存设置失败');
      }

      const sectionName = section === 'blog' ? '博客' : section === 'qa' ? '问答' : '方案';
      setMessage(`${sectionName}设置保存成功！`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('保存设置失败:', error);
      setMessage('保存设置失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    router.push('/admin');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

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
                href="/admin/whitelist"
                className="text-gray-700 hover:bg-blue-50 hover:text-blue-700 group flex items-center px-2 py-2 text-base font-medium rounded-md"
              >
                网站白名单
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
              <h1 className="text-2xl font-bold text-gray-900">发布设置</h1>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? '保存中...' : '保存设置'}
              </button>
            </div>

            {message && (
              <div className={`mb-4 p-3 rounded-md ${message.includes('成功') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {message}
              </div>
            )}

            {/* 博客设置 */}
            <div className="mb-6 p-4 border border-gray-200 rounded-md">
              <h2 className="text-lg font-medium text-gray-900 mb-4">博客设置</h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">发布方式</label>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">人工审核后发布</span>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">每日最多自动发布数量</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  step="1"
                  value={settings.blog.dailyLimit}
                  onChange={(e) => handleDailyLimitChange('blog', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">定时发布</label>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">开启定时发布</span>
                  <button
                    onClick={() => handleScheduleEnabledChange('blog', !settings.blog.scheduleEnabled)}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${settings.blog.scheduleEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${settings.blog.scheduleEnabled ? 'translate-x-7' : 'translate-x-1'}`}
                    ></span>
                  </button>
                </div>
              </div>

              {settings.blog.scheduleEnabled && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">定时发布时间</label>
                  <input
                    type="time"
                    value={settings.blog.scheduleTime}
                    onChange={(e) => handleScheduleTimeChange('blog', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">随机发布</label>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">开启随机发布</span>
                  <button
                    onClick={() => handleRandomEnabledChange('blog', !settings.blog.randomEnabled)}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${settings.blog.randomEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${settings.blog.randomEnabled ? 'translate-x-7' : 'translate-x-1'}`}
                    ></span>
                  </button>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleSaveSection('blog')}
                  disabled={saving}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-base font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {saving ? '保存中...' : '💾 保存博客设置'}
                </button>
              </div>
            </div>

            {/* 问答设置 */}
            <div className="mb-6 p-4 border border-gray-200 rounded-md">
              <h2 className="text-lg font-medium text-gray-900 mb-4">问答设置</h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">发布方式</label>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">人工审核后发布</span>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">每日最多自动发布数量</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  step="1"
                  value={settings.qa.dailyLimit}
                  onChange={(e) => handleDailyLimitChange('qa', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">定时发布</label>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">开启定时发布</span>
                  <button
                    onClick={() => handleScheduleEnabledChange('qa', !settings.qa.scheduleEnabled)}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${settings.qa.scheduleEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${settings.qa.scheduleEnabled ? 'translate-x-7' : 'translate-x-1'}`}
                    ></span>
                  </button>
                </div>
              </div>

              {settings.qa.scheduleEnabled && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">定时发布时间</label>
                  <input
                    type="time"
                    value={settings.qa.scheduleTime}
                    onChange={(e) => handleScheduleTimeChange('qa', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">随机发布</label>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">开启随机发布</span>
                  <button
                    onClick={() => handleRandomEnabledChange('qa', !settings.qa.randomEnabled)}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${settings.qa.randomEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${settings.qa.randomEnabled ? 'translate-x-7' : 'translate-x-1'}`}
                    ></span>
                  </button>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleSaveSection('qa')}
                  disabled={saving}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-base font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {saving ? '保存中...' : '💾 保存问答设置'}
                </button>
              </div>
            </div>

            {/* 方案设置 */}
            <div className="mb-6 p-4 border border-gray-200 rounded-md">
              <h2 className="text-lg font-medium text-gray-900 mb-4">方案设置</h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">发布方式</label>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">人工审核后发布</span>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">每日最多自动发布数量</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  step="1"
                  value={settings.cases.dailyLimit}
                  onChange={(e) => handleDailyLimitChange('cases', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">定时发布</label>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">开启定时发布</span>
                  <button
                    onClick={() => handleScheduleEnabledChange('cases', !settings.cases.scheduleEnabled)}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${settings.cases.scheduleEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${settings.cases.scheduleEnabled ? 'translate-x-7' : 'translate-x-1'}`}
                    ></span>
                  </button>
                </div>
              </div>

              {settings.cases.scheduleEnabled && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">定时发布时间</label>
                  <input
                    type="time"
                    value={settings.cases.scheduleTime}
                    onChange={(e) => handleScheduleTimeChange('cases', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">随机发布</label>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">开启随机发布</span>
                  <button
                    onClick={() => handleRandomEnabledChange('cases', !settings.cases.randomEnabled)}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${settings.cases.randomEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${settings.cases.randomEnabled ? 'translate-x-7' : 'translate-x-1'}`}
                    ></span>
                  </button>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleSaveSection('cases')}
                  disabled={saving}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-base font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {saving ? '保存中...' : '💾 保存方案设置'}
                </button>
              </div>
            </div>

            {/* 网站白名单管理 */}
            <div className="mb-6 p-4 border border-gray-200 rounded-md">
              <h2 className="text-lg font-medium text-gray-900 mb-4">网站白名单管理</h2>
              
              {whitelistMessage && (
                <div className={`mb-4 p-3 rounded-md ${whitelistMessage.includes('成功') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {whitelistMessage}
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">添加域名</label>
                <div className="flex space-x-4">
                  <input
                    type="text"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    placeholder="例如: www.example.com"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddWhitelistDomain()}
                  />
                  <button
                    onClick={handleAddWhitelistDomain}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium"
                  >
                    添加
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">白名单域名列表</label>
                {whitelistDomains.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">暂无白名单域名</p>
                ) : (
                  <ul className="space-y-2">
                    {whitelistDomains.map((domain, index) => (
                      <li key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <span className="text-gray-900">{domain}</span>
                        <button
                          onClick={() => handleRemoveWhitelistDomain(domain)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded-md text-sm font-medium"
                        >
                          删除
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-700">
                  <strong>说明：</strong>白名单中的域名在GEO检测时会获得高分（85-95分），可用于展示成功案例。
                </p>
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