-- Create PublishSettings table
CREATE TABLE "PublishSettings" (
  "id" SERIAL PRIMARY KEY,
  "section" TEXT UNIQUE NOT NULL,
  "strategy" TEXT NOT NULL,
  "dailyLimit" INTEGER NOT NULL DEFAULT 1,
  "scheduleEnabled" BOOLEAN NOT NULL DEFAULT false,
  "scheduleTime" TEXT NOT NULL DEFAULT '08:00',
  "randomEnabled" BOOLEAN NOT NULL DEFAULT false,
  "randomTargetTime" TEXT,
  "randomTargetDate" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create RandomPublishLog table
CREATE TABLE "RandomPublishLog" (
  "id" SERIAL PRIMARY KEY,
  "section" TEXT NOT NULL,
  "date" TIMESTAMP NOT NULL,
  "publishedCount" INTEGER NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE ("section", "date")
);

-- Create Blog table
CREATE TABLE "Blog" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "date" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "publishedAt" TIMESTAMP,
  "publishAt" TIMESTAMP,
  "similarTitles" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Qa table
CREATE TABLE "Qa" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "date" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "publishedAt" TIMESTAMP,
  "publishAt" TIMESTAMP,
  "similarTitles" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Cases table
CREATE TABLE "Cases" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "date" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "publishedAt" TIMESTAMP,
  "publishAt" TIMESTAMP,
  "similarTitles" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);