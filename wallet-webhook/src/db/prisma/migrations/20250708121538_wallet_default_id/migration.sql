-- AlterTable
CREATE SEQUENCE wallet_id_seq;
ALTER TABLE "Wallet" ALTER COLUMN "id" SET DEFAULT nextval('wallet_id_seq');
ALTER SEQUENCE wallet_id_seq OWNED BY "Wallet"."id";
