/*
  Warnings:

  - You are about to drop the column `accessToken` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `walletUserId` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Account_accessToken_key";

-- DropIndex
DROP INDEX "User_walletUserId_key";

-- AlterTable
ALTER TABLE "Account" DROP COLUMN "accessToken";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "walletUserId";

-- CreateTable
CREATE TABLE "Wallet" (
    "id" INTEGER NOT NULL,
    "accountId" INTEGER NOT NULL,
    "walletUserId" INTEGER,
    "name" TEXT NOT NULL,
    "accessToken" TEXT,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_walletUserId_key" ON "Wallet"("walletUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_accessToken_key" ON "Wallet"("accessToken");

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
