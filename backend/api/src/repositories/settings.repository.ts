import { prisma } from "../utils/prisma.js";

export const settingsRepository = {
    async getOrCreate() {
        return prisma.appSetting.upsert({
            where: { id: "default" },
            create: { id: "default", theme: "dark" },
            update: {},
        });
    },

    async update(theme: "dark" | "light") {
        return prisma.appSetting.upsert({
            where: { id: "default" },
            create: { id: "default", theme },
            update: { theme },
        });
    },
};
