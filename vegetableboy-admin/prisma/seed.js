import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create zones first
  const zones = await Promise.all([
    prisma.zone.create({ data: { name: 'Block A', area: 'Sector 4, Green Colony' } }),
    prisma.zone.create({ data: { name: 'Block B', area: 'New Area, Plot Zone' } }),
    prisma.zone.create({ data: { name: 'Block C', area: 'Main Road, Lane 3' } }),
  ]);

  console.log('Created zones:', zones.map(z => z.name));

  // Create products
  const products = await Promise.all([
    prisma.product.create({ data: { name: 'Hari Mirch', image: 'https://images.unsplash.com/photo-1568035105640-89559a10b5ca?w=200&h=200&fit=crop', category: 'Spicy', available: true, price250: 22, price500: 42, price1kg: 80 } }),
    prisma.product.create({ data: { name: 'Aloo', image: 'https://images.unsplash.com/photo-1518977676601-b53f82b2d1d9?w=200&h=200&fit=crop', category: 'Staple', available: true, price250: 18, price500: 34, price1kg: 65 } }),
    prisma.product.create({ data: { name: 'Tamatar', image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200&h=200&fit=crop', category: 'Staple', available: true, price250: 20, price500: 38, price1kg: 72 } }),
    prisma.product.create({ data: { name: 'Palak', image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=200&h=200&fit=crop', category: 'Leafy', available: false, price250: 14, price500: 26, price1kg: 48 } }),
    prisma.product.create({ data: { name: 'Pyaaz', image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=200&h=200&fit=crop', category: 'Staple', available: true, price250: 24, price500: 45, price1kg: 86 } }),
    prisma.product.create({ data: { name: 'Bhindi', image: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=200&h=200&fit=crop', category: 'Seasonal', available: true, price250: 28, price500: 52, price1kg: 98 } }),
  ]);

  console.log('Created products:', products.map(p => p.name));

  // Create delivery persons
  const deliveryPersons = await Promise.all([
    prisma.deliveryPerson.create({ data: { name: 'Raju Delivery', phone: '9700001111', image: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200&h=200&fit=crop', zoneId: zones[0].id, active: true } }),
    prisma.deliveryPerson.create({ data: { name: 'Suresh Kumar', phone: '9700002222', image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200&h=200&fit=crop', zoneId: zones[1].id, active: true } }),
    prisma.deliveryPerson.create({ data: { name: 'Ramesh Yadav', phone: '9700003333', image: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&h=200&fit=crop', zoneId: zones[2].id, active: true } }),
  ]);

  console.log('Created delivery persons:', deliveryPersons.map(dp => dp.name));

  // Create users
  const users = await Promise.all([
    prisma.user.create({ data: { name: 'Sohan Kumar', phone: '9876543210', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop', zoneId: zones[0].id, block: 'A-1', building: 'Sunrise Tower', flat: '204', active: true } }),
    prisma.user.create({ data: { name: 'Rohan Sharma', phone: '9845671230', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop', zoneId: zones[0].id, block: 'A-2', building: 'Green View', flat: '112', active: true } }),
    prisma.user.create({ data: { name: 'Bapan Das', phone: '9012345678', image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop', zoneId: zones[1].id, block: 'B-1', building: 'Lake Side', flat: '305', active: true } }),
    prisma.user.create({ data: { name: 'Meena Devi', phone: '9988776655', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop', zoneId: zones[1].id, block: 'B-2', building: 'Hill Park', flat: '78', active: false } }),
    prisma.user.create({ data: { name: 'Anjali Singh', phone: '9123456789', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop', zoneId: zones[2].id, block: 'C-1', building: 'River View', flat: '401', active: true } }),
  ]);

  console.log('Created users:', users.map(u => u.name));

  // Create orders with items
  const ordersData = [
    {
      id: 'ORD-2340', userId: users[0].id, zoneId: zones[0].id, total: 100, status: 'delivered', payment: 'cash',
      items: [
        { productId: products[0].id, variant: '500g', qty: 2 },
        { productId: products[1].id, variant: '1kg', qty: 1 },
      ]
    },
    {
      id: 'ORD-2341', userId: users[1].id, zoneId: zones[0].id, total: 117, status: 'delivered', payment: 'online',
      items: [
        { productId: products[2].id, variant: '250g', qty: 3 },
        { productId: products[3].id, variant: '500g', qty: 1 },
      ]
    },
    {
      id: 'ORD-2342', userId: users[2].id, zoneId: zones[1].id, total: 97, status: 'pending', payment: null,
      items: [
        { productId: products[5].id, variant: '500g', qty: 2 },
        { productId: products[0].id, variant: '250g', qty: 1 },
      ]
    },
    {
      id: 'ORD-2343', userId: users[3].id, zoneId: zones[1].id, total: 59, status: 'failed', payment: null,
      items: [
        { productId: products[1].id, variant: '500g', qty: 2 },
      ]
    },
    {
      id: 'ORD-2344', userId: users[4].id, zoneId: zones[2].id, total: 130, status: 'pending', payment: null,
      items: [
        { productId: products[2].id, variant: '1kg', qty: 1 },
        { productId: products[4].id, variant: '500g', qty: 2 },
      ]
    },
  ];

  for (const orderData of ordersData) {
    const { id, userId, zoneId, total, status, payment, items } = orderData;
    await prisma.order.create({
      data: {
        id, userId, zoneId, total, status, payment,
        items: { create: items },
      },
    });
  }

  console.log('Created 5 orders');
  console.log('Seed complete! ✅');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
