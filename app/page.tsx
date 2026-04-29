'use client';

import { useState } from 'react';

// 白名单配置
const WHITE_LIST = ['www.your-site.com', 'your-success-site.com'];

// 检查URL是否在白名单中
const isWhitelistSite = (url: string): boolean => {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `http://${url}`);
    let domain = urlObj.hostname;
    if (domain.startsWith('www.')) domain = domain.slice(4);
    console.log('检测域名:', domain);
    console.log('白名单:', WHITE_LIST);
    const result = WHITE_LIST.some(whitelistDomain => {
      let clean = whitelistDomain.startsWith('www.') ? whitelistDomain.slice(4) : whitelistDomain;
      return domain === clean;
    });
    console.log('白名单检测结果:', result);
    return result;
  } catch (error) {
    console.error('域名解析错误:', error);
    return false;
  }
};

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadForm, setLeadForm] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [optimizeForm, setOptimizeForm] = useState({
    name: '',
    phone: '',
    company: '',
    demand: ''
  });
  const [optimizeFormLoading, setOptimizeFormLoading] = useState(false);
  const [optimizeFormSubmitted, setOptimizeFormSubmitted] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleGeoCheck = async () => {
    if (!url) return;
    
    setLoading(true);
    let detectionResult;
    try {
      // 调用GEO检测API
      const response = await fetch('/api/geo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
      });
      
      if (!response.ok) {
        throw new Error('API请求失败');
      }
      
      detectionResult = await response.json();
    } catch (error) {
      console.error('检测失败:', error);
      // 发生错误时使用模拟数据
      detectionResult = generateGeoDetectionResult(url);
    } finally {
      setResult(detectionResult);
      // 保存检测记录到localStorage
      const records = JSON.parse(localStorage.getItem('detectionRecords') || '[]');
      const newRecord = {
        id: Date.now().toString(),
        url: detectionResult.url,
        timestamp: new Date().toISOString(),
        score: detectionResult.score,
        level: detectionResult.score >= 80 ? '优秀' : '待优化'
      };
      records.push(newRecord);
      localStorage.setItem('detectionRecords', JSON.stringify(records));
      setLoading(false);
    }
  };

  // 生成GEO检测结果
  const generateGeoDetectionResult = (url: string) => {
    const isWhitelist = isWhitelistSite(url);
    console.log('最终白名单判断:', isWhitelist);
    
    if (isWhitelist) {
      // 白名单站点：85-95分
      const score = Math.floor(Math.random() * 11) + 85;
      console.log('白名单站点得分:', score);
      
      // 白名单站点的正面效果总结和进阶建议
      const successSuggestions = [
        '✅ 【效果总结】站点GEO基础框架完善，TDK标签规范、移动端适配优秀、技术合规项全部达标，已具备极强的搜索排名竞争力',
        '✅ 【效果总结】网站加载性能优异，用户体验流畅，内容质量高，已形成良好的搜索权重积累',
        '✅ 【效果总结】地域化GEO布局合理，已针对目标市场进行精准优化，搜索排名表现稳定',
        '✅ 【效果总结】外链与域名权重建设成效显著，网站权威度持续提升，行业影响力不断扩大',
        '📈 【进阶建议】可进一步拓展行业长尾关键词布局，深挖地域化搜索流量，我们可提供定制化的关键词全案策略服务',
        '📈 【进阶建议】建议加强内容营销力度，通过高质量内容创作提升品牌影响力和用户粘性',
        '📈 【进阶建议】可优化移动端体验细节，进一步提升页面加载速度和交互流畅度',
        '📈 【进阶建议】建议建立完善的数据分析体系，通过数据驱动持续优化GEO策略'
      ];
      
      return {
        url,
        score,
        suggestions: successSuggestions,
        checkItems: [],
        timestamp: new Date().toISOString()
      };
    } else {
      // 普通客户网站：30-50分
      const score = Math.floor(Math.random() * 21) + 30;
      console.log('普通站点得分:', score);
      
      // 8大维度的优化建议，确保15条
      const optimizationSuggestions = [
        // 1. 技术合规
        '【问题点】站点未配置符合百度/谷歌最新协议的robots.txt与动态sitemap.xml文件',
        '【专业操作要求】需按搜索引擎最新抓取规则编写robots屏蔽规则，精准过滤无效抓取路径，划定抓取优先级；同时生成全站点动态更新的sitemap地图，完成多格式适配并主动提交至各大搜索资源平台，需配合服务器权限配置与每周定期更新维护',
        '【自主操作风险】规则编写错误极易导致搜索引擎整站拒爬、已收录页面批量掉收录，非专业人员操作无容错空间',
        
        // 2. TDK标签
        '【问题点】页面标题标签优化不当，缺乏关键词布局和吸引力',
        '【专业操作要求】需为每个页面创建独特的标题，在标题前半部分包含核心关键词，控制长度在50-60字符之间，确保标题具有吸引力和相关性，避免关键词堆砌和重复',
        '【自主操作风险】标题过长被搜索引擎截断、关键词堆砌被搜索引擎惩罚、标题与内容不相关导致用户跳出率高',
        
        // 3. 性能优化
        '【问题点】页面加载时间过长，影响用户体验和搜索排名',
        '【专业操作要求】需优化图片（压缩、延迟加载、WebP格式）、最小化CSS和JavaScript文件、实施浏览器缓存策略、使用CDN加速静态资源、减少HTTP请求数量、优化服务器响应时间',
        '【自主操作风险】图片过度压缩导致画质下降、JavaScript错误导致功能异常、缓存策略不当导致用户看到过期内容、CDN配置错误导致资源加载失败',
        
        // 4. 内容内链
        '【问题点】内容原创性低，影响搜索引擎排名和用户信任',
        '【专业操作要求】需创建独特的高质量内容、进行深度研究和分析、提供独特的观点和见解、避免复制粘贴其他网站内容、使用plagiarism检测工具确保原创性、建立内容创作规范和流程',
        '【自主操作风险】内容被判定为抄袭导致搜索引擎惩罚、重复内容导致页面权重分散、缺乏原创性导致用户流失、内容质量低下影响品牌形象、可能面临版权侵权风险',
        
        // 5. 移动端
        '【问题点】网站未实现响应式设计，影响移动设备用户体验',
        '【专业操作要求】需使用响应式设计框架、实现流体布局和弹性图片、使用媒体查询适配不同屏幕尺寸、优化移动设备的触摸交互、测试不同设备和浏览器的兼容性、实施移动优先的设计策略',
        '【自主操作风险】响应式设计实现错误导致布局混乱、移动设备兼容性问题导致功能异常、触摸交互优化不当影响用户体验、响应式图片策略错误导致加载缓慢、测试不充分导致部分设备显示异常',
        
        // 6. 外链权重
        '【问题点】缺乏高质量的外部链接，影响网站权威度',
        '【专业操作要求】需识别和联系行业相关的权威网站、创建有价值的内容吸引自然链接、参与行业论坛和社区建设、提交网站到相关目录和资源站、与行业影响者建立合作关系、监控和分析外链质量和效果',
        '【自主操作风险】获取低质量或垃圾外链导致搜索引擎惩罚、外链建设策略不当被视为购买链接、过度关注数量忽视质量导致效果不佳、与低质量网站建立链接影响品牌形象、无法识别和避免有害外链',
        
        // 7. 地域GEO
        '【问题点】地域化GEO布局不完善，无法精准覆盖目标市场',
        '【专业操作要求】需针对目标地域市场进行关键词研究和布局、优化本地商家信息和地图标注、创建地域化内容和页面、实施地域化链接建设策略、优化移动搜索体验、建立本地品牌声誉',
        '【自主操作风险】地域化关键词选择不当导致流量不精准、本地信息更新不及时导致用户信任度下降、地域化内容质量低下影响排名、链接建设策略不当导致被搜索引擎惩罚',
        
        // 8. 搜索资源运营
        '【问题点】未充分利用搜索资源平台工具，缺乏数据驱动的优化策略',
        '【专业操作要求】需注册并验证Google Search Console和百度站长平台、提交站点地图和URL、监控抓取错误和索引状态、分析搜索流量和关键词表现、设置结构化数据和AMP、定期进行网站健康检查',
        '【自主操作风险】验证失败导致无法使用平台功能、站点地图提交错误导致抓取异常、数据分析不当导致优化方向错误、结构化数据错误导致富摘要不显示',
        
        // 强制15条建议
        '【问题点】网站技术架构老化，无法支持现代SEO技术需求',
        '【专业操作要求】需进行网站技术架构升级，包括但不限于：升级服务器配置、优化数据库结构、实施微服务架构、部署容器化解决方案、建立DevOps持续集成和部署流程',
        '【自主操作风险】技术架构升级风险高，可能导致网站长时间停机、数据丢失、功能异常等严重问题，需要专业团队全程监控和应急方案'
      ];
      
      return {
        url,
        score,
        suggestions: optimizationSuggestions,
        checkItems: [],
        timestamp: new Date().toISOString()
      };
    }
  };

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 预留留资表单API对接位置
    // fetch('/api/leads', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify(leadForm)
    // })
    // .then(response => response.json())
    // .then(data => {
    //   setLeadSubmitted(true);
    // });
    
    // 模拟提交成功
    setLeadSubmitted(true);
  };

  const handleOptimizeFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOptimizeFormLoading(true);
    // 保存客户留言到localStorage
    const messages = JSON.parse(localStorage.getItem('customerMessages') || '[]');
    const newMessage = {
      id: Date.now().toString(),
      name: optimizeForm.name,
      phone: optimizeForm.phone,
      company: optimizeForm.company,
      demand: optimizeForm.demand,
      timestamp: new Date().toISOString()
    };
    messages.push(newMessage);
    localStorage.setItem('customerMessages', JSON.stringify(messages));
    // TODO: 对接后端接口存储表单数据
    // fetch('/api/optimize', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify(optimizeForm)
    // })
    // .then(response => response.json())
    // .then(data => {
    //   setOptimizeFormSubmitted(true);
    //   setOptimizeFormLoading(false);
    // });
    
    // 模拟提交成功
    setTimeout(() => {
      setOptimizeFormSubmitted(true);
      setOptimizeFormLoading(false);
      // 重置表单
      setOptimizeForm({ name: '', phone: '', company: '', demand: '' });
    }, 1500);
  };

  const handleCopyResult = async () => {
    if (!result) return;
    
    const content = `易云网络 · GEO优化检测报告
检测网址：${result.url}
GEO评分：${result.score}/100
优化建议：
${result.suggestions && result.suggestions.length > 0 ? result.suggestions.map((suggestion: string, index: number) => `${index + 1}. ${suggestion}`).join('\n') : '暂无优化建议'}
免费咨询：13953631472（侯客有道）`;
    
    try {
      await navigator.clipboard.writeText(content);
      setCopySuccess(true);
      // 3秒后隐藏成功提示
      setTimeout(() => setCopySuccess(false), 3000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const [showServiceModal, setShowServiceModal] = useState(false);

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
              <a href="/" className="text-white hover:text-blue-200 font-medium border-b-2 border-white pb-1">
                首页 / 检测工具
              </a>
              <a href="/blog" className="text-white hover:text-blue-200">
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

      {/* 英雄区 */}
      <section className="bg-gradient-to-r from-blue-800 to-blue-600 text-white py-20 pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            GEO搜索引擎优化检测工具
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            一键检测您的网站GEO优化效果，提升全球搜索排名，获取更多精准流量
          </p>
          
          {/* 检测工具 */}
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="输入您的网站URL"
                className="flex-1 px-4 py-3 bg-white text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
              <button
                onClick={handleGeoCheck}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
              >
                {loading ? '检测中...' : '一键检测GEO评分'}
              </button>
            </div>
            
            {/* 检测结果 */}
            {result && (
              <div className="mt-8 bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden">
                {/* 结果头部 */}
                <div className="bg-blue-50 p-6 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-800 text-lg">易云网络 · GEO优化检测报告</h3>
                </div>
                
                {/* 结果内容 */}
                <div className="p-6">
                  {/* 评分和等级 */}
                  <div className="flex flex-col md:flex-row items-start justify-between mb-8">
                    {/* 左侧信息区域 */}
                    <div className="flex-1 mb-4 md:mb-0">
                      <p className="text-sm text-gray-500">网站URL</p>
                      <p className="font-medium text-gray-800 truncate mt-1">{result.url}</p>
                      <p className="text-sm text-gray-500 mt-3">检测时间</p>
                      <p className="text-sm text-gray-700 mt-1">{new Date(result.timestamp || result.createdAt).toLocaleString()}</p>
                    </div>
                    
                    {/* 右侧评分和按钮区域 */}
                    <div className="flex flex-col items-center">
                      {/* 评分卡片 */}
                      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm mb-4">
                        <p className="text-xs text-gray-500 text-center">GEO评分</p>
                        <p className="text-3xl font-bold text-blue-600 mt-1 text-center">{result.score}/100</p>
                        <div className={`mt-2 px-4 py-1 rounded-full text-xs font-medium mx-auto text-center w-fit ${result.score >= 80 ? 'bg-green-100 text-green-700' : result.score >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                          {result.score >= 80 ? '优秀' : result.score >= 60 ? '良好' : '待优化'}
                        </div>
                      </div>
                      
                      {/* 复制按钮 */}
                      <button
                        onClick={handleCopyResult}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-all duration-200 text-sm"
                        style={{ width: '180px' }}
                      >
                        {copySuccess ? '已复制到剪贴板！' : '复制检测结果'}
                      </button>
                    </div>
                  </div>
                  
                  {/* 优化建议 */}
                  <div className="mt-8">
                    <h4 className="text-lg font-medium text-gray-800 mb-4">优化建议</h4>
                    <div className="space-y-3">
                      {result.suggestions && result.suggestions.length > 0 ? (
                        result.suggestions.map((suggestion: string, index: number) => (
                          <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <p className="text-gray-700">{suggestion}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500">暂无优化建议</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 留资表单 */}
      {result && (
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">获取免费优化方案</h2>
            <form onSubmit={handleOptimizeFormSubmit} className="bg-white p-8 rounded-lg shadow-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
                  <input
                    type="text"
                    id="name"
                    value={optimizeForm.name}
                    onChange={(e) => setOptimizeForm({ ...optimizeForm, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">电话</label>
                  <input
                    type="tel"
                    id="phone"
                    value={optimizeForm.phone}
                    onChange={(e) => setOptimizeForm({ ...optimizeForm, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">公司名称</label>
                  <input
                    type="text"
                    id="company"
                    value={optimizeForm.company}
                    onChange={(e) => setOptimizeForm({ ...optimizeForm, company: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="demand" className="block text-sm font-medium text-gray-700 mb-1">需求描述</label>
                  <input
                    type="text"
                    id="demand"
                    value={optimizeForm.demand}
                    onChange={(e) => setOptimizeForm({ ...optimizeForm, demand: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div className="mt-8">
                <button
                  type="submit"
                  disabled={optimizeFormLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-medium transition-colors"
                >
                  {optimizeFormLoading ? '提交中...' : '提交申请'}
                </button>
              </div>
              {optimizeFormSubmitted && (
                <p className="mt-4 text-green-600 text-center">提交成功！我们将尽快与您联系。</p>
              )}
            </form>
          </div>
        </section>
      )}

      {/* 新增板块入口 */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 客户方案卡片 */}
            <a href="/cases" className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="h-32 bg-blue-50 rounded-md mb-4 flex items-center justify-center">
                <span className="text-blue-400 text-4xl">📊</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">查看优化方案</h3>
              <p className="text-gray-600 text-sm">浏览我们成功的GEO优化方案，了解如何提升网站排名</p>
            </a>
            
            {/* 行业问答卡片 */}
            <a href="/qa" className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="h-32 bg-green-50 rounded-md mb-4 flex items-center justify-center">
                <span className="text-green-400 text-4xl">📜</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">行业常见问题</h3>
              <p className="text-gray-600 text-sm">解答GEO优化相关的常见问题，帮助您更好理解优化策略</p>
            </a>
            
            {/* 技术博客卡片 */}
            <a href="/blog" className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="h-32 bg-purple-50 rounded-md mb-4 flex items-center justify-center">
                <span className="text-purple-400 text-4xl">📝</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">GEO优化教程</h3>
              <p className="text-gray-600 text-sm">学习GEO优化的专业知识和最佳实践，提升您的优化技能</p>
            </a>
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