-- Testimonial approval flow: client submissions start unapproved.
-- Existing rows (admin-created before this migration) are grandfathered in
-- as approved — the UPDATE only runs when the column is first added.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Testimonial' AND column_name = 'approved'
  ) THEN
    ALTER TABLE "Testimonial" ADD COLUMN "approved" BOOLEAN NOT NULL DEFAULT false;
    UPDATE "Testimonial" SET "approved" = true;
  END IF;
END $$;
