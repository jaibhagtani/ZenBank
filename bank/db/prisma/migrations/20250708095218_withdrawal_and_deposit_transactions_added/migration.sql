/*
  Warnings:

  - You are about to drop the `DepositTransaction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WithdrawTransaction` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DepositTransaction" DROP CONSTRAINT "DepositTransaction_accountId_fkey";

-- DropForeignKey
ALTER TABLE "WithdrawTransaction" DROP CONSTRAINT "WithdrawTransaction_accountId_fkey";

-- DropTable
DROP TABLE "DepositTransaction";

-- DropTable
DROP TABLE "WithdrawTransaction";

-- CreateTable
CREATE TABLE "DepositToBankTransaction" (
    "id" SERIAL NOT NULL,
    "accountId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" "TransactionStatus" NOT NULL,
    "provider" TEXT NOT NULL,
    "bankToken" TEXT NOT NULL,
    "walletToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DepositToBankTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WithdrawFromBankTransaction" (
    "id" SERIAL NOT NULL,
    "accountId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" "TransactionStatus" NOT NULL,
    "provider" TEXT NOT NULL,
    "bankToken" TEXT NOT NULL,
    "walletToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WithdrawFromBankTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DepositToBankTransaction_bankToken_key" ON "DepositToBankTransaction"("bankToken");

-- CreateIndex
CREATE UNIQUE INDEX "DepositToBankTransaction_walletToken_key" ON "DepositToBankTransaction"("walletToken");

-- CreateIndex
CREATE UNIQUE INDEX "WithdrawFromBankTransaction_bankToken_key" ON "WithdrawFromBankTransaction"("bankToken");

-- CreateIndex
CREATE UNIQUE INDEX "WithdrawFromBankTransaction_walletToken_key" ON "WithdrawFromBankTransaction"("walletToken");

-- AddForeignKey
ALTER TABLE "DepositToBankTransaction" ADD CONSTRAINT "DepositToBankTransaction_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WithdrawFromBankTransaction" ADD CONSTRAINT "WithdrawFromBankTransaction_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
