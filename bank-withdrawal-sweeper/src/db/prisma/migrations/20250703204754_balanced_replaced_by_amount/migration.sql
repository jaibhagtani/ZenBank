/*
  Warnings:

  - You are about to drop the column `balance` on the `BankAccount` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "BankAccount" DROP COLUMN "balance",
ADD COLUMN     "amount" INTEGER NOT NULL DEFAULT 20000;
