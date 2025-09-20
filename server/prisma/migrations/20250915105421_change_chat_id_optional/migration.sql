-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Hub" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "creatorId" TEXT NOT NULL,
    "chatId" TEXT,
    "name" TEXT,
    "description" TEXT,
    "image" TEXT,
    "code" TEXT NOT NULL,
    "type" INTEGER NOT NULL DEFAULT 1,
    "status" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Hub_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Hub_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Hub" ("chatId", "code", "createdAt", "creatorId", "description", "id", "image", "name", "status", "type", "updatedAt") SELECT "chatId", "code", "createdAt", "creatorId", "description", "id", "image", "name", "status", "type", "updatedAt" FROM "Hub";
DROP TABLE "Hub";
ALTER TABLE "new_Hub" RENAME TO "Hub";
CREATE UNIQUE INDEX "Hub_chatId_key" ON "Hub"("chatId");
CREATE UNIQUE INDEX "Hub_code_key" ON "Hub"("code");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
