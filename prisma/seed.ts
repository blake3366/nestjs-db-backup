import { PrismaClient } from '@prisma/client';
import { users } from './seed-data/user-data';
const prisma = new PrismaClient();

const main = async () => {
    await seedUser();
};

const seedUser = async () => {
    // await prisma.user.createMany({   // 不能用 因為有關聯
    //     data: users,
    //     skipDuplicates: true, // 可選，避免重複資料
    // });
    for (const user of users) {
        await prisma.user.create({
            data: {
              ...user,
              profile: { create: user.profile },
              posts: { create: user.posts },
            },
          });
    }
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});