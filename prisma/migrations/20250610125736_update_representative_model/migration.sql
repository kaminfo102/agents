/*
  Warnings:

  - Added the required column `birthDate` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `education` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fieldOfStudy` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maritalStatus` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.
  - Made the column `address` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `educationCenter` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `fatherName` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "representativeCode" TEXT,
    "nationalId" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "fatherName" TEXT NOT NULL,
    "birthDate" DATETIME NOT NULL,
    "maritalStatus" TEXT NOT NULL,
    "education" TEXT NOT NULL,
    "fieldOfStudy" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "landlinePhone" TEXT,
    "city" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "educationCenter" TEXT NOT NULL,
    "profileImage" TEXT,
    "contractFile" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "role" TEXT NOT NULL DEFAULT 'REPRESENTATIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("address", "city", "createdAt", "educationCenter", "fatherName", "firstName", "id", "isActive", "lastName", "nationalId", "phoneNumber", "profileImage", "role", "updatedAt") SELECT "address", "city", "createdAt", "educationCenter", "fatherName", "firstName", "id", "isActive", "lastName", "nationalId", "phoneNumber", "profileImage", "role", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_representativeCode_key" ON "User"("representativeCode");
CREATE UNIQUE INDEX "User_nationalId_key" ON "User"("nationalId");
CREATE UNIQUE INDEX "User_phoneNumber_key" ON "User"("phoneNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
