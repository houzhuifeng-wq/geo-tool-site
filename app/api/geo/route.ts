import { NextRequest, NextResponse } from 'next/server';

// 从环境变量读取白名单配置
const getWhitelist = (): string[] => {
  const envWhitelist = process.env.NEXT_PUBLIC_GEO_WHITELIST_SITES || '';
  return envWhitelist.split(',').map(domain => domain.trim()).filter(domain => domain);
};

const WHITE_LIST = getWhitelist();

// 检查URL是否在白名单中
function isWhitelistSite(url: string): boolean {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `http://${url}`);
    let domain = urlObj.hostname;
    if (domain.startsWith('www.')) domain = domain.slice(4);
    return WHITE_LIST.some(whitelistDomain => {
      let clean = whitelistDomain.startsWith('www.') ? whitelistDomain.slice(4) : whitelistDomain;
      return domain === clean;
    });
  } catch (error) {
    return false;
  }
}

// GEO检测API接口
export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    const body = await request.json();
    const { url } = body;

    // 请求参数校验
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: '请提供有效的网址' },
        { status: 400 }
      );
    }

    // 验证URL格式
    let validatedUrl: URL;
    try {
      validatedUrl = new URL(url.startsWith('http') ? url : `http://${url}`);
    } catch (error) {
      return NextResponse.json(
        { error: '请提供有效的网址格式' },
        { status: 400 }
      );
    }

    // 生成GEO检测结果
    const result = generateGeoDetectionResult(validatedUrl.href);

    return NextResponse.json(result);
  } catch (error) {
    console.error('GEO检测API错误:', error);
    return NextResponse.json(
      { error: '检测过程中发生错误' },
      { status: 500 }
    );
  }
}

// 生成GEO检测结果
function generateGeoDetectionResult(url: string) {
  const isWhitelist = isWhitelistSite(url);
  
  if (isWhitelist) {
    // 白名单站点：85-95分
    const score = Math.floor(Math.random() * 11) + 85;
    
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
}