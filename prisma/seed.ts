import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: process.env.DATABASE_URL?.replace('file:', '') || './dev.db' }),
});

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@serene.com' },
    update: {},
    create: {
      email: 'admin@serene.com',
      name: 'System Admin',
      role: 'ADMIN',
    },
  });

  // Create materials
  const amethyst = await prisma.material.create({
    data: {
      name: 'Amethyst',
      hardness: 7.0,
      color: 'Purple',
      properties: JSON.stringify({ metaphysical: 'Calming, intuition' }),
    },
  });

  const roseQuartz = await prisma.material.create({
    data: {
      name: 'Rose Quartz',
      hardness: 7.0,
      color: 'Pink',
      properties: JSON.stringify({ metaphysical: 'Love, compassion' }),
    },
  });

  const silver = await prisma.material.create({
    data: {
      name: 'Sterling Silver',
      hardness: 2.5,
      color: 'Silver',
      properties: JSON.stringify({ purity: '925' }),
    },
  });

  // Create products
  const amethystBead = await prisma.product.create({
    data: {
      name: 'Amethyst Round Bead',
      description: 'Polished natural amethyst bead',
      category: 'BEAD',
      variants: {
        create: [
          {
            sku: 'BEAD-AMY-8MM-AA',
            materialId: amethyst.id,
            size: 8.0,
            quality: 'AA',
            pricing: {
              create: {
                price: 1.50,
              },
            },
            inventory: {
              create: {
                type: 'REPLENISH',
                quantity: 1000,
                notes: 'Initial stock',
              },
            },
          },
        ],
      },
    },
  });

  const roseQuartzBead = await prisma.product.create({
    data: {
      name: 'Rose Quartz Round Bead',
      description: 'Polished natural rose quartz bead',
      category: 'BEAD',
      variants: {
        create: [
          {
            sku: 'BEAD-RSQ-8MM-AA',
            materialId: roseQuartz.id,
            size: 8.0,
            quality: 'AA',
            pricing: {
              create: {
                price: 1.20,
              },
            },
            inventory: {
              create: {
                type: 'REPLENISH',
                quantity: 1000,
                notes: 'Initial stock',
              },
            },
          },
        ],
      },
    },
  });

  const silverSpacer = await prisma.product.create({
    data: {
      name: 'Silver Ring Spacer',
      description: 'Simple sterling silver ring spacer',
      category: 'SPACER',
      variants: {
        create: [
          {
            sku: 'SPCR-SLV-RNG',
            materialId: silver.id,
            size: 6.0,
            quality: 'STANDARD',
            pricing: {
              create: {
                price: 2.00,
              },
            },
            inventory: {
              create: {
                type: 'REPLENISH',
                quantity: 500,
                notes: 'Initial stock',
              },
            },
          },
        ],
      },
    },
  });

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
