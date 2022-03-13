-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN', 'PELAYAN', 'KOKI');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT E'USER',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Food" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" INTEGER NOT NULL,

    CONSTRAINT "Food_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "food" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "qty" INTEGER NOT NULL,
    "total" DECIMAL(65,30) NOT NULL,
    "dateOrder" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "discount" INTEGER NOT NULL DEFAULT 0,
    "pemesan" TEXT NOT NULL,
    "pelayanId" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_name_key" ON "User"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Order_pelayanId_key" ON "Order"("pelayanId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_pelayanId_fkey" FOREIGN KEY ("pelayanId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
