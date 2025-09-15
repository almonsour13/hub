import bcrypt from "bcryptjs";
import { prisma } from "../../src/lib/prisma";

const users = [
    { name: "Alice", email: "alice@example.com", password: "alice123" },
    { name: "Bob", email: "bob@example.com", password: "bob123" },
    { name: "Charlie", email: "charlie@example.com", password: "charlie123" },
];

async function main() {
    for (const user of users) {
        const hashedPassword = await bcrypt.hash(user.password, 12);

        const createdUser = await prisma.user.create({
            data: {
                name: user.name,
                email: user.email,
                password: hashedPassword,
                provider: "credentials",
            },
        });

        console.log("Created user:", createdUser.email);
    }
}

main()
    .catch((e) => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
