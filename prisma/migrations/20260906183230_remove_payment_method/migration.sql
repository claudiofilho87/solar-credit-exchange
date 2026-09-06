/*
  Warnings:

  - You are about to drop the column `paymentMethod` on the `Donation` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Donation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "stateCode" TEXT NOT NULL,
    "utilityId" TEXT NOT NULL,
    "utilityName" TEXT NOT NULL,
    "ngoId" TEXT NOT NULL,
    "ngoName" TEXT NOT NULL,
    "creditsKwh" REAL NOT NULL,
    "amountBrl" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Donation" ("amountBrl", "createdAt", "creditsKwh", "id", "ngoId", "ngoName", "stateCode", "utilityId", "utilityName") SELECT "amountBrl", "createdAt", "creditsKwh", "id", "ngoId", "ngoName", "stateCode", "utilityId", "utilityName" FROM "Donation";
DROP TABLE "Donation";
ALTER TABLE "new_Donation" RENAME TO "Donation";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
