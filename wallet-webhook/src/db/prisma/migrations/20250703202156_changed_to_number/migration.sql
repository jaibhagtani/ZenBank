/*
  Warnings:

  - You are about to drop the column `phoneNumber` on the `BankUser` table. All the data in the column will be lost.
  - Added the required column `number` to the `BankUser` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BankUser" DROP COLUMN "phoneNumber",
ADD COLUMN     "number" TEXT NOT NULL;
