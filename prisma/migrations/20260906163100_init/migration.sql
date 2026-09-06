-- CreateTable
CREATE TABLE "Doacao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "estadoUf" TEXT NOT NULL,
    "distribuidoraId" TEXT NOT NULL,
    "distribuidoraNome" TEXT NOT NULL,
    "ongId" TEXT NOT NULL,
    "ongNome" TEXT NOT NULL,
    "creditosKwh" REAL NOT NULL,
    "valorBrl" REAL,
    "metodoPagto" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
