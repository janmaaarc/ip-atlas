-- CreateTable
CREATE TABLE "GeoCache" (
    "id" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "cachedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GeoCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SharedLink" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "geoData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SharedLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GeoCache_ip_key" ON "GeoCache"("ip");

-- CreateIndex
CREATE INDEX "GeoCache_cachedAt_idx" ON "GeoCache"("cachedAt");

-- CreateIndex
CREATE UNIQUE INDEX "SharedLink_token_key" ON "SharedLink"("token");

-- CreateIndex
CREATE INDEX "SharedLink_expiresAt_idx" ON "SharedLink"("expiresAt");
