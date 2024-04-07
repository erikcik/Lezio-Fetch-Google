-- CreateTable
CREATE TABLE `openDates` (
    `id` VARCHAR(191) NOT NULL,
    `day` VARCHAR(191) NULL,
    `hours` VARCHAR(191) NULL,
    `restaurantId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `openDates` ADD CONSTRAINT `openDates_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `Restaurant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
