// lib/duplicateChecker.ts

/**
 * 计算两个字符串的 Jaccard 相似度
 * @param str1 字符串1
 * @param str2 字符串2
 * @returns 相似度（0-1）
 */
export function jaccardSimilarity(str1: string, str2: string): number {
  const cleanStr1 = str1.toLowerCase().replace(/[^\w\s]/g, '');
  const cleanStr2 = str2.toLowerCase().replace(/[^\w\s]/g, '');
  
  const words1 = new Set(cleanStr1.split(/\s+/).filter(word => word.length > 0));
  const words2 = new Set(cleanStr2.split(/\s+/).filter(word => word.length > 0));
  
  if (words1.size === 0 && words2.size === 0) return 0;
  
  let intersection = 0;
  words1.forEach(word => {
    if (words2.has(word)) intersection++;
  });
  
  const union = words1.size + words2.size - intersection;
  
  return intersection / union;
}

/**
 * 检查正文局部重复
 */
export function checkContentDuplicate(newContent: string, existingContent: string, fragmentLength: number = 50): boolean {
  const checkContent = newContent.substring(0, 200) + newContent.substring(Math.max(0, newContent.length - 200));
  
  for (let i = 0; i <= checkContent.length - fragmentLength; i++) {
    const fragment = checkContent.substring(i, i + fragmentLength);
    if (fragment.trim().length === 0) continue;
    if (existingContent.includes(fragment)) {
      return true;
    }
  }
  
  return false;
}

/**
 * 完整的查重检查
 */
export function checkDuplicate(
  section: string,
  newTitle: string,
  newContent: string,
  threshold: number = 0.6
): { isDuplicate: boolean; similarTitles: string[] } {
  const similarTitles: string[] = [];
  let publishedItems: any[] = [];
  
  switch (section) {
    case 'blog': {
      const blogPosts = localStorage.getItem('blogPosts');
      if (blogPosts) {
        publishedItems = JSON.parse(blogPosts).filter((item: any) => item.status === 'published');
      }
      break;
    }
    case 'qa': {
      const qaItems = localStorage.getItem('qaItems');
      if (qaItems) {
        publishedItems = JSON.parse(qaItems).filter((item: any) => item.status === 'published');
      }
      break;
    }
    case 'cases': {
      const caseStudies = localStorage.getItem('caseStudies');
      if (caseStudies) {
        publishedItems = JSON.parse(caseStudies).filter((item: any) => item.status === 'published');
      }
      break;
    }
    default:
      break;
  }
  
  for (const item of publishedItems) {
    const title = item.title || item.question || '';
    const content = item.content || item.answer || '';
    
    const titleSimilarity = jaccardSimilarity(newTitle, title);
    if (titleSimilarity >= threshold) {
      similarTitles.push(title);
    }
    
    if (checkContentDuplicate(newContent, content)) {
      return { isDuplicate: true, similarTitles };
    }
  }
  
  if (similarTitles.length > 0) {
    return { isDuplicate: true, similarTitles };
  }
  
  return { isDuplicate: false, similarTitles: [] };
}

/**
 * 检查是否启用查重功能
 */
export function isDuplicateCheckEnabled(): boolean {
  const enabled = localStorage.getItem('enable_duplicate_check');
  return enabled === null || JSON.parse(enabled) === true;
}