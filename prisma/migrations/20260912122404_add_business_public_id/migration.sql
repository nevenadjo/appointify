/*
  Warnings:

  - A unique constraint covering the columns `[publicId]` on the table `Business` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Business" ADD COLUMN     "publicId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Business_publicId_key" ON "Business"("publicId");
