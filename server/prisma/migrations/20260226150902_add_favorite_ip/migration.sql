-- CreateTable
CREATE TABLE "FavoriteIp" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "label" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FavoriteIp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FavoriteIp_userId_createdAt_idx" ON "FavoriteIp"("userId", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "FavoriteIp_userId_ipAddress_key" ON "FavoriteIp"("userId", "ipAddress");

-- AddForeignKey
ALTER TABLE "FavoriteIp" ADD CONSTRAINT "FavoriteIp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
