// AI调用核心功能

/**
 * 生成AI内容
 * @param prompt 提示词
 * @returns AI生成的内容
 */
export async function generateAIContent(prompt: string): Promise<string> {
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
    throw new Error('AI API配置不完整，请检查环境变量');
  }

  try {
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
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // 提取AI生成的内容
    if (data.choices && data.choices.length > 0 && data.choices[0].message) {
      return data.choices[0].message.content;
    } else {
      throw new Error('AI响应格式错误');
    }
  } catch (error) {
    console.error('AI调用失败:', error);
    throw new Error(`AI调用失败: ${error instanceof Error ? error.message : '未知错误'}`);
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