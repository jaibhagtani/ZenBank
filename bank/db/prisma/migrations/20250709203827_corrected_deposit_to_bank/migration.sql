/*
  Warnings:

  - You are about to drop the column `bankToken` on the `DepositToBankTransaction` table. All the data in the column will be lost.
  - You are about to drop the column `walletToken` on the `DepositToBankTransaction` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[withdrawToken]` on the table `DepositToBankTransaction` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `withdrawToken` to the `DepositToBankTransaction` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "DepositToBankTransaction_bankToken_key";

-- DropIndex
DROP INDEX "DepositToBankTransaction_walletToken_key";

-- AlterTable
ALTER TABLE "DepositToBankTransaction" DROP COLUMN "bankToken",
DROP COLUMN "walletToken",
ADD COLUMN     "withdrawToken" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "DepositToBankTransaction_withdrawToken_key" ON "DepositToBankTransaction"("withdrawToken");
