import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const newPlayer = await prisma.player.create({
        data: {
            name: "Nadim",
            team: "KPL",
            basePrice: 500,
        },
    });

    console.log(newPlayer);
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });