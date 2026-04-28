const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 数据库路径
const dbPath = path.join(__dirname, 'prisma', 'dev.db');

// 打开数据库连接
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('连接数据库失败:', err.message);
    return;
  }
  console.log('成功连接到数据库');
});

// 创建表
db.serialize(() => {
  // 创建 PublishSettings 表
  db.run(`
    CREATE TABLE IF NOT EXISTS PublishSettings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      section TEXT UNIQUE,
      strategy TEXT,
      dailyLimit INTEGER DEFAULT 1,
      scheduleEnabled BOOLEAN DEFAULT false,
      scheduleTime TEXT DEFAULT '08:00',
      randomEnabled BOOLEAN DEFAULT false,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 创建 RandomPublishLog 表
  db.run(`
    CREATE TABLE IF NOT EXISTS RandomPublishLog (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      section TEXT,
      date DATETIME,
      publishedCount INTEGER,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(section, date)
    )
  `);

  // 创建 Blog 表
  db.run(`
    CREATE TABLE IF NOT EXISTS Blog (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      content TEXT,
      excerpt TEXT,
      category TEXT,
      status TEXT DEFAULT 'pending',
      publishedAt DATETIME,
      publishAt DATETIME,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 创建 QA 表
  db.run(`
    CREATE TABLE IF NOT EXISTS QA (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT,
      answer TEXT,
      category TEXT,
      status TEXT DEFAULT 'pending',
      publishedAt DATETIME,
      publishAt DATETIME,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 创建 CaseStudy 表（修改表名，避免使用保留字）
     db.run(`
       CREATE TABLE IF NOT EXISTS CaseStudy (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         title TEXT,
         content TEXT,
         client TEXT,
         industry TEXT,
         status TEXT DEFAULT 'pending',
         publishedAt DATETIME,
         publishAt DATETIME,
         createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
         updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
       )
     `);

  // 插入默认数据
  db.run(`
    INSERT OR IGNORE INTO PublishSettings (section, strategy, dailyLimit)
    VALUES ('blog', 'manual', 1), ('qa', 'manual', 1), ('cases', 'manual', 1)
  `);

  console.log('数据库初始化完成');
});

// 关闭数据库连接
db.close((err) => {
  if (err) {
    console.error('关闭数据库连接失败:', err.message);
    return;
  }
  console.log('数据库连接已关闭');
});