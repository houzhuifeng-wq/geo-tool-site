/*
  Warnings:

  - Added the required column `section` to the `PublishSettings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `strategy` to the `PublishSettings` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PublishSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "section" TEXT NOT NULL,
    "strategy" TEXT NOT NULL,
    "dailyLimit" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_PublishSettings" ("createdAt", "dailyLimit", "id", "updatedAt") SELECT "createdAt", "dailyLimit", "id", "updatedAt" FROM "PublishSettings";
DROP TABLE "PublishSettings";
ALTER TABLE "new_PublishSettings" RENAME TO "PublishSettings";
CREATE UNIQUE INDEX "PublishSettings_section_key" ON "PublishSettings"("section");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
