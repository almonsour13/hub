import bcrypt from "bcryptjs";
import { prisma } from "../../src/lib/prisma";

const users = [
    { name: "Alice", email: "alice@example.com", password: "alice123" },
    {
        name: "Bob",
        email: "bob@example.com",
        password: "bob123",
        hub: [
            "DevSphere",
            "StudyNest",
            "ChillZone",
            "NextGen Ideas",
            "PixelTalks",
        ],
    },
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

        // If user has hubs, create them
        if (user.hub && user.hub.length > 0) {
            for (const hubName of user.hub) {
                // Create a chat first
                const chat = await prisma.chat.create({
                    data: {
                        type: 2, // hub chat
                    },
                });

                // Then create the hub and link the chatId
                const hub = await prisma.hub.create({
                    data: {
                        name: hubName,
                        description: `${hubName} Hub`,
                        code:
                            hubName.toUpperCase().replace(/\s+/g, "-") +
                            "-CODE",
                        creatorId: createdUser.id,
                        chatId: chat.id, // ✅ link chat here
                        members: {
                            create: [
                                {
                                    userId: createdUser.id,
                                    role: 1, // 1 = owner/admin
                                },
                            ],
                        },
                    },
                    include: {
                        members: true,
                        chat: true,
                    },
                });

                console.log(
                    `Created hub "${hub.name}" with chat for ${createdUser.email}`
                );
            }
        }
    }
}

main()
    .catch((e) => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
