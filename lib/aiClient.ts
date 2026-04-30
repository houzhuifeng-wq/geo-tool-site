// AI调用核心功能

// 全局请求锁，防止同时发起多个AI请求
let isRequesting = false;

/**
 * 生成AI内容
 * @param prompt 提示词
 * @returns AI生成的内容
 */
export async function generateAIContent(prompt: string): Promise<string> {
  // 检查是否已有请求在进行中
  if (isRequesting) {
    throw new Error('已有AI请求正在进行中，请等待完成后再试');
  }
  isRequesting = true;
  
  try {
    // 域名防盗用检查
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const allowedHostnames = ['yiyun.aisourcegeo.com', 'localhost', '127.0.0.1'];
    if (!allowedHostnames.includes(hostname)) {
      throw new Error('当前域名未授权使用AI功能');
    }
  }

  // 读取环境变量
  const API_KEY = process.env.NEXT_PUBLIC_DOUBAO_API_KEY;
  const ENDPOINT_ID = process.env.NEXT_PUBLIC_DOUBAO_ENDPOINT_ID;
  const MODEL_ID = process.env.NEXT_PUBLIC_DOUBAO_MODEL_ID;

  // 检查环境变量是否存在
  if (!API_KEY || !ENDPOINT_ID || !MODEL_ID) {
    console.error('AI API配置不完整:', {
      API_KEY: !!API_KEY,
      ENDPOINT_ID: !!ENDPOINT_ID,
      MODEL_ID: !!MODEL_ID
    });
    throw new Error('AI API配置不完整，请检查环境变量');
  }

  // 创建超时Promise
  const timeoutPromise = new Promise<string>((_, reject) => {
    setTimeout(() => {
      reject(new Error('AI请求超时，服务器响应时间过长，请稍后重试'));
    }, 120000); // 120秒超时
  });

  // 创建API请求Promise
  const apiPromise = new Promise<string>(async (resolve, reject) => {
    try {
      console.log('开始调用AI API...');
      const startTime = Date.now();
      
      // 创建AbortController实现超时控制
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 100000); // 100秒超时

      // 调用火山引擎API
      const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: MODEL_ID,
          endpoint_id: ENDPOINT_ID,
          messages: [{
            role: 'user',
            content: prompt
          }],
          max_tokens: 2000,
          temperature: 0.7
        }),
        signal: controller.signal
      });

      // 请求完成后清除超时定时器
      clearTimeout(timeoutId);

      const duration = Date.now() - startTime;
      console.log(`AI API响应时间: ${duration}ms`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API请求失败:', response.status, response.statusText, errorText);
        throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('AI API响应:', data);

      // 提取AI生成的内容
      if (data.choices && data.choices.length > 0 && data.choices[0].message) {
        resolve(data.choices[0].message.content);
      } else {
        throw new Error('AI响应格式错误');
      }
    } catch (error) {
      console.error('AI调用失败:', error);
      reject(new Error(`AI调用失败: ${error instanceof Error ? error.message : '未知错误'}`));
    }
  });

    // 使用Promise.race实现超时控制
    return await Promise.race([apiPromise, timeoutPromise]);
  } catch (error) {
    console.error('AI调用最终失败:', error);
    throw error;
  } finally {
    // 释放请求锁
    isRequesting = false;
  }
}

// 类型定义
export interface AIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}