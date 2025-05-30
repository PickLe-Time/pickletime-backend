/*
  Warnings:

  - You are about to drop the column `username` on the `Setting` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `Setting` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Setting` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `role` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'BASIC');

-- DropForeignKey
ALTER TABLE "Setting" DROP CONSTRAINT "Setting_username_fkey";

-- DropIndex
DROP INDEX "Setting_username_key";

-- AlterTable
ALTER TABLE "Setting" DROP COLUMN "username",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL;

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Setting_userId_key" ON "Setting"("userId");

-- AddForeignKey
ALTER TABLE "Setting" ADD CONSTRAINT "Setting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
