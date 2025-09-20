import { prisma } from "../../src/lib/prisma";

async function main() {
    // Delete in the right order to respect foreign keys
    await prisma.attachment.deleteMany({});
    await prisma.edit.deleteMany({});
    await prisma.message.deleteMany({});

    console.log("✅ Cleared message, edit, and attachment tables");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
