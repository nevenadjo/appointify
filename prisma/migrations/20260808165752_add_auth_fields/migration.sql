/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Session` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Account" DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailVerified" TIMESTAMP(3),
ADD COLUMN     "name" TEXT;
