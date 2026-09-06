-- CreateTable
CREATE TABLE "Donation" (
    "id" TEXT NOT NULL,
    "stateCode" TEXT NOT NULL,
    "utilityId" TEXT NOT NULL,
    "utilityName" TEXT NOT NULL,
    "ngoId" TEXT NOT NULL,
    "ngoName" TEXT NOT NULL,
    "creditsKwh" DOUBLE PRECISION NOT NULL,
    "amountBrl" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Donation_pkey" PRIMARY KEY ("id")
);
