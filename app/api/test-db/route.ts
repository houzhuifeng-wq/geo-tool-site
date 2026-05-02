// app/api/test-cron/route.ts
export async function GET(request: Request) {
  try {
    // 测试环境变量
    const cronSecret = process.env.CRON_SECRET;
    const databaseUrl = process.env.DATABASE_URL;
    
    // 验证 token
    const url = new URL(request.url);
    const urlToken = url.searchParams.get('token');
    
    return new Response(JSON.stringify({
      success: true,
      cronSecretSet: !!cronSecret,
      databaseUrlSet: !!databaseUrl,
      tokenReceived: urlToken || '未提供',
      tokenValid: urlToken === cronSecret,
      timestamp: new Date().toISOString()
    }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    }), { status: 500 });
  }
}