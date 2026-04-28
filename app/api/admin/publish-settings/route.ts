import { promises as fs } from 'fs';
import path from 'path';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

// 数据库路径
const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');

// 板块类型
type Section = 'blog' | 'qa' | 'cases';

// 请求体类型
interface PublishSettingsRequest {
  section: Section;
  strategy: 'auto' | 'manual';
  dailyLimit?: number;
  scheduleEnabled?: boolean;
  scheduleTime?: string;
  randomEnabled?: boolean;
}

// 响应体类型
interface PublishSettingsResponse {
  section: Section;
  strategy: 'auto' | 'manual';
  dailyLimit: number;
  scheduleEnabled: boolean;
  scheduleTime: string;
  randomEnabled: boolean;
}

export async function GET() {
  try {
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    // 获取所有板块的发布设置
    const settings = await db.all('SELECT * FROM PublishSettings');
    
    // 定义默认设置
    const defaultSettings: Record<Section, PublishSettingsResponse> = {
      blog: { section: 'blog', strategy: 'manual', dailyLimit: 1, scheduleEnabled: false, scheduleTime: '08:00', randomEnabled: false },
      qa: { section: 'qa', strategy: 'manual', dailyLimit: 1, scheduleEnabled: false, scheduleTime: '08:00', randomEnabled: false },
      cases: { section: 'cases', strategy: 'manual', dailyLimit: 1, scheduleEnabled: false, scheduleTime: '08:00', randomEnabled: false }
    };
    
    // 合并数据库中的设置
    settings.forEach(setting => {
      if (setting.section && defaultSettings[setting.section as Section]) {
        defaultSettings[setting.section as Section] = {
          section: setting.section as Section,
          strategy: setting.strategy as 'auto' | 'manual',
          dailyLimit: setting.dailyLimit || 1,
          scheduleEnabled: setting.scheduleEnabled || false,
          scheduleTime: setting.scheduleTime || '08:00',
          randomEnabled: setting.randomEnabled || false
        };
      }
    });

    await db.close();
    
    return new Response(JSON.stringify(Object.values(defaultSettings)), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('获取发布设置失败:', error);
    return new Response(JSON.stringify({ error: '获取发布设置失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST(request: Request) {
  try {
    const body: PublishSettingsRequest = await request.json();
    const { section, strategy, dailyLimit = 1, scheduleEnabled = false, scheduleTime = '08:00', randomEnabled = false } = body;
    
    // 验证 dailyLimit 范围
    const validatedDailyLimit = Math.max(1, Math.min(10, dailyLimit));
    
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    // 更新或创建发布设置
    await db.run(`
      INSERT OR REPLACE INTO PublishSettings (section, strategy, dailyLimit, scheduleEnabled, scheduleTime, randomEnabled)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [section, strategy, validatedDailyLimit, scheduleEnabled, scheduleTime, randomEnabled]);

    await db.close();
    
    return new Response(JSON.stringify({
      section,
      strategy,
      dailyLimit: validatedDailyLimit,
      scheduleEnabled,
      scheduleTime,
      randomEnabled
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('更新发布设置失败:', error);
    return new Response(JSON.stringify({ error: '更新发布设置失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}