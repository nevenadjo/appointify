-- Preserve historical reviews without inventing detailed ratings.
ALTER TABLE "Review"
ADD COLUMN "serviceRating" INTEGER,
ADD COLUMN "cleanlinessRating" INTEGER,
ADD COLUMN "valueRating" INTEGER,
ADD COLUMN "punctualityRating" INTEGER;
