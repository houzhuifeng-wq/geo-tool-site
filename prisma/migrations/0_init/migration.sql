-- Create PublishSettings table
CREATE TABLE "publishsettings" (
  "id" SERIAL PRIMARY KEY,
  "section" TEXT UNIQUE NOT NULL,
  "strategy" TEXT NOT NULL,
  "dailylimit" INTEGER NOT NULL DEFAULT 1,
  "scheduleenabled" BOOLEAN NOT NULL DEFAULT false,
  "scheduletime" TEXT NOT NULL DEFAULT '08:00',
  "randomenabled" BOOLEAN NOT NULL DEFAULT false,
  "randomtargettime" TEXT,
  "randomtargetdate" TIMESTAMP,
  "createdat" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedat" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create RandomPublishLog table
CREATE TABLE "randompublishlog" (
  "id" SERIAL PRIMARY KEY,
  "section" TEXT NOT NULL,
  "date" TIMESTAMP NOT NULL,
  "publishedcount" INTEGER NOT NULL,
  "createdat" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE ("section", "date")
);

-- Create Blog table
CREATE TABLE "blogs" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "date" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "publishedat" TIMESTAMP,
  "publishat" TIMESTAMP,
  "similartitles" TEXT,
  "createdat" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedat" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Qa table
CREATE TABLE "qas" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "date" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "publishedat" TIMESTAMP,
  "publishat" TIMESTAMP,
  "similartitles" TEXT,
  "createdat" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedat" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Cases table
CREATE TABLE "cases" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "date" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "publishedat" TIMESTAMP,
  "publishat" TIMESTAMP,
  "similartitles" TEXT,
  "createdat" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedat" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);