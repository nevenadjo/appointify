/*
  Warnings:

  - Made the column `publicId` on table `Business` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Business" ALTER COLUMN "publicId" SET NOT NULL;
