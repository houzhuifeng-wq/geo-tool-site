import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
    // 获取所有板块的发布设置
    const settings = await prisma.publishSettings.findMany();
    
    // 定义默认设置
    const defaultSettings: Record<Section, PublishSettingsResponse> = {
      blog: { section: 'blog', strategy: 'manual', dailyLimit: 1, scheduleEnabled: false, scheduleTime: '08:00', randomEnabled: false },
      qa: { section: 'qa', strategy: 'manual', dailyLimit: 1, scheduleEnabled: false, scheduleTime: '08:00', randomEnabled: false },
      cases: { section: 'cases', strategy: 'manual', dailyLimit: 1, scheduleEnabled: false, scheduleTime: '08:00', randomEnabled: false }
    };
    
    // 合并数据库中的设置
    settings.forEach((setting: any) => {
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

    await prisma.$disconnect();
    
    return new Response(JSON.stringify(Object.values(defaultSettings)), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('获取发布设置失败:', error);
    await prisma.$disconnect();
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

    // 更新或创建发布设置
    await prisma.publishSettings.upsert({
      where: { section },
      update: {
        strategy,
        dailyLimit: validatedDailyLimit,
        scheduleEnabled,
        scheduleTime,
        randomEnabled
      },
      create: {
        section,
        strategy,
        dailyLimit: validatedDailyLimit,
        scheduleEnabled,
        scheduleTime,
        randomEnabled
      }
    });

    await prisma.$disconnect();
    
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
    await prisma.$disconnect();
    return new Response(JSON.stringify({ error: '更新发布设置失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}