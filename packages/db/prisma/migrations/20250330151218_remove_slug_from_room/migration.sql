/*
  Warnings:

  - You are about to drop the column `slug` on the `Room` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Room_slug_key";

-- AlterTable
ALTER TABLE "Room" DROP COLUMN "slug";
