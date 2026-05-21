const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'chef@chantier.fr' },
    update: {},
    create: {
      email: 'chef@chantier.fr',
      name: 'Jean Chef',
      password: hashedPassword,
    },
  });

  await prisma.site.create({
    data: {
      name: 'Rénovation Mairie',
      address: '1 Place de l\'Hôtel de Ville, 75004 Paris',
      companyName: 'BTP PRO SAS',
    }
  });

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
