-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Member" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hubId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nickname" TEXT,
    "role" INTEGER NOT NULL DEFAULT 3,
    "status" INTEGER NOT NULL DEFAULT 1,
    "lastSeenId" TEXT,
    "lastSeenAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Member_hubId_fkey" FOREIGN KEY ("hubId") REFERENCES "Hub" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Member_lastSeenId_fkey" FOREIGN KEY ("lastSeenId") REFERENCES "Message" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Member" ("createdAt", "hubId", "id", "nickname", "role", "status", "updatedAt", "userId") SELECT "createdAt", "hubId", "id", "nickname", "role", "status", "updatedAt", "userId" FROM "Member";
DROP TABLE "Member";
ALTER TABLE "new_Member" RENAME TO "Member";
CREATE UNIQUE INDEX "Member_hubId_userId_key" ON "Member"("hubId", "userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
