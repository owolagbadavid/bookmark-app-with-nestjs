/*
  Warnings:

  - You are about to drop the column `updatedAT` on the `Bookmark` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Bookmark` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Bookmark" DROP COLUMN "updatedAT",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
