/*
  Warnings:

  - You are about to drop the column `userId` on the `Setting` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[username]` on the table `Setting` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `username` to the `Setting` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Setting" DROP CONSTRAINT "Setting_userId_fkey";

-- DropIndex
DROP INDEX "Setting_userId_key";

-- AlterTable
ALTER TABLE "Setting" DROP COLUMN "userId",
ADD COLUMN     "username" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Setting_username_key" ON "Setting"("username");

-- AddForeignKey
ALTER TABLE "Setting" ADD CONSTRAINT "Setting_username_fkey" FOREIGN KEY ("username") REFERENCES "User"("username") ON DELETE CASCADE ON UPDATE CASCADE;
