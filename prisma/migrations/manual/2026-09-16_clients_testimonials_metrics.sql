-- Client gallery features (PIN, selects), testimonials, first-party metrics.
-- Idempotent: safe to run more than once.

ALTER TABLE "Gallery" ADD COLUMN IF NOT EXISTS "pin" TEXT;
ALTER TABLE "Image" ADD COLUMN IF NOT EXISTS "selected" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS "Testimonial" (
    "id" TEXT NOT NULL,
    "quote" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT,
    "sortOrder" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Metric" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "path" TEXT,
    "referrer" TEXT,
    "visitor" TEXT,
    "device" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Metric_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Metric_createdAt_idx" ON "Metric"("createdAt");
CREATE INDEX IF NOT EXISTS "Metric_type_idx" ON "Metric"("type");
