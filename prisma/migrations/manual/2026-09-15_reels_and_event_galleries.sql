-- Reels feed + event gallery direct links.
-- Idempotent: safe to run more than once. Applied outside `prisma migrate`
-- because the production DB has tables (Blog, Settings, VideoProject) that
-- predate the migration history — do NOT use `prisma db push` on this DB.

ALTER TABLE "Gallery" ADD COLUMN IF NOT EXISTS "slug" TEXT;
ALTER TABLE "Gallery" ADD COLUMN IF NOT EXISTS "unlisted" BOOLEAN NOT NULL DEFAULT false;
CREATE UNIQUE INDEX IF NOT EXISTS "Gallery_slug_key" ON "Gallery"("slug");

CREATE TABLE IF NOT EXISTS "SocialVideo" (
    "id" TEXT NOT NULL,
    "caption" TEXT,
    "sourceUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "sortOrder" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SocialVideo_pkey" PRIMARY KEY ("id")
);
