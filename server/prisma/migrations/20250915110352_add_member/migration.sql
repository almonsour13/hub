-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hubId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 1,
    "nickname" TEXT,
    "role" INTEGER NOT NULL DEFAULT 3,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Member_hubId_fkey" FOREIGN KEY ("hubId") REFERENCES "Hub" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Member_hubId_userId_key" ON "Member"("hubId", "userId");
