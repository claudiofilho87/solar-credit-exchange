-- CreateTable
CREATE TABLE "Donation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "stateCode" TEXT NOT NULL,
    "utilityId" TEXT NOT NULL,
    "utilityName" TEXT NOT NULL,
    "ngoId" TEXT NOT NULL,
    "ngoName" TEXT NOT NULL,
    "creditsKwh" REAL NOT NULL,
    "amountBrl" REAL,
    "paymentMethod" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
