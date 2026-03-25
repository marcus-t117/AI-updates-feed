-- CreateTable
CREATE TABLE "feed_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "source" TEXT NOT NULL,
    "author" TEXT,
    "publishedAt" TIMESTAMPTZ NOT NULL,
    "fetchedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feed_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "feed_items_url_key" ON "feed_items"("url");

-- CreateIndex
CREATE INDEX "feed_items_publishedAt_idx" ON "feed_items"("publishedAt" DESC);

-- CreateIndex
CREATE INDEX "feed_items_source_idx" ON "feed_items"("source");
