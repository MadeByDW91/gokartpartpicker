import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create sample parts
  const enginePart = await prisma.part.create({
    data: {
      name: 'Predator 212 Engine',
      sku: 'PRED212',
      brand: 'Harbor Freight',
      description: '212cc 4-stroke engine, 6.5 HP',
      price: new Prisma.Decimal('149.99'),
      imageUrls: [],
      category: 'engine',
    },
  });

  const clutchPart = await prisma.part.create({
    data: {
      name: 'Max Torque Clutch',
      sku: 'MT-12T',
      brand: 'Max Torque',
      description: '12 tooth centrifugal clutch for 3/4" shaft',
      price: new Decimal('45.99'),
      imageUrls: [],
      category: 'clutch',
    },
  });

  const sprocketPart = await prisma.part.create({
    data: {
      name: '60T Sprocket',
      sku: 'GPS-60T',
      brand: 'Go Power Sports',
      description: '60 tooth #35 chain sprocket',
      price: new Decimal('24.99'),
      imageUrls: [],
      category: 'sprocket',
    },
  });

  const chainPart = await prisma.part.create({
    data: {
      name: '#35 Chain 10ft',
      sku: 'GPS-CHAIN35-10',
      brand: 'Go Power Sports',
      description: '10 foot #35 roller chain',
      price: new Decimal('19.99'),
      imageUrls: [],
      category: 'chain',
    },
  });

  // Create compatibility profiles
  await prisma.compatibilityProfile.create({
    data: {
      partId: enginePart.id,
      shaftDiameter: '3/4"',
      engineModel: '212cc',
      notes: 'Keyed shaft, max RPM 3600, gasoline fuel',
    },
  });

  await prisma.compatibilityProfile.create({
    data: {
      partId: clutchPart.id,
      shaftDiameter: '3/4"',
      chainSize: '#35',
      notes: '12 tooth, engagement RPM 1800',
    },
  });

  await prisma.compatibilityProfile.create({
    data: {
      partId: sprocketPart.id,
      chainSize: '#35',
      boltPattern: '4-bolt',
      notes: '60 tooth sprocket',
    },
  });

  await prisma.compatibilityProfile.create({
    data: {
      partId: chainPart.id,
      chainSize: '#35',
      notes: '10ft length, 3/8" pitch',
    },
  });

  // Create a sample build
  const build = await prisma.build.create({
    data: {
      userName: 'John Doe',
    },
  });

  // Add parts to build
  await prisma.buildItem.create({
    data: {
      buildId: build.id,
      partId: enginePart.id,
      slotCategory: 'engine',
      quantity: 1,
    },
  });

  await prisma.buildItem.create({
    data: {
      buildId: build.id,
      partId: clutchPart.id,
      slotCategory: 'clutch',
      quantity: 1,
    },
  });

  await prisma.buildItem.create({
    data: {
      buildId: build.id,
      partId: sprocketPart.id,
      slotCategory: 'sprocket',
      quantity: 1,
    },
  });

  await prisma.buildItem.create({
    data: {
      buildId: build.id,
      partId: chainPart.id,
      slotCategory: 'chain',
      quantity: 1,
    },
  });

  console.log('✅ Seeding completed!');
  console.log(`   Created ${await prisma.part.count()} parts`);
  console.log(`   Created ${await prisma.compatibilityProfile.count()} compatibility profiles`);
  console.log(`   Created ${await prisma.build.count()} builds`);
  console.log(`   Created ${await prisma.buildItem.count()} build items`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
