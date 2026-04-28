-- CreateTable
CREATE TABLE "RandomPublishLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "section" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "publishedCount" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PublishSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "section" TEXT NOT NULL,
    "strategy" TEXT NOT NULL,
    "dailyLimit" INTEGER NOT NULL DEFAULT 1,
    "scheduleEnabled" BOOLEAN NOT NULL DEFAULT false,
    "scheduleTime" TEXT NOT NULL DEFAULT '08:00',
    "randomEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_PublishSettings" ("createdAt", "dailyLimit", "id", "section", "strategy", "updatedAt") SELECT "createdAt", "dailyLimit", "id", "section", "strategy", "updatedAt" FROM "PublishSettings";
DROP TABLE "PublishSettings";
ALTER TABLE "new_PublishSettings" RENAME TO "PublishSettings";
CREATE UNIQUE INDEX "PublishSettings_section_key" ON "PublishSettings"("section");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "RandomPublishLog_section_date_key" ON "RandomPublishLog"("section", "date");
