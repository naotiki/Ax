-- CreateTable
CREATE TABLE "Project" (
    "id" SERIAL NOT NULL,
    "NewField_ET2r" TEXT NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewModel_0ICE" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,

    CONSTRAINT "NewModel_0ICE_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "NewModel_0ICE" ADD CONSTRAINT "NewModel_0ICE_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
