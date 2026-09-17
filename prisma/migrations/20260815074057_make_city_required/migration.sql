/*
  Warnings:

  - Made the column `cityId` on table `Business` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Business" DROP CONSTRAINT "Business_cityId_fkey";

-- AlterTable
ALTER TABLE "Business" ALTER COLUMN "cityId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Business" ADD CONSTRAINT "Business_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
