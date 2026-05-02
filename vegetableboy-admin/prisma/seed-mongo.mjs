import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Cleanup existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.user.deleteMany();
  await prisma.product.deleteMany();
  await prisma.zoneDeliveryPerson.deleteMany();
  await prisma.deliveryPersonSettlement.deleteMany();
  await prisma.deliveryPerson.deleteMany();
  await prisma.zone.deleteMany();
  await prisma.admin.deleteMany();

  console.log("Cleaned existing data.");

  // Admin
  const admin = await prisma.admin.create({
    data: { username: "Admin", password: "Admin@123" }
  });
  console.log("Admin created:", admin.username);

  // Zones
  const zones = await prisma.zone.createMany({
    data: [
      { name: "Andheri", area: "Andheri East, Mumbai" },
      { name: "Bandra", area: "Bandra West, Mumbai" },
      { name: "Juhu", area: "Juhu Beach, Mumbai" },
      { name: "Powai", area: "Powai, Mumbai" },
      { name: "Dadar", area: "Dadar West, Mumbai" },
    ],
  });
  console.log("Zones created:", zones.count);

  const allZones = await prisma.zone.findMany();

  // Products
  const products = await prisma.product.createMany({
    data: [
      { name: "Tomato", category: "Vegetable", price250: 15, price500: 28, price1kg: 50, image: "https://placehold.co/100x100/orange/white?text=Tomato" },
      { name: "Potato", category: "Vegetable", price250: 12, price500: 22, price1kg: 40, image: "https://placehold.co/100x100/brown/white?text=Potato" },
      { name: "Onion", category: "Vegetable", price250: 18, price500: 35, price1kg: 65, image: "https://placehold.co/100x100/purple/white?text=Onion" },
      { name: "Carrot", category: "Vegetable", price250: 20, price500: 38, price1kg: 70, image: "https://placehold.co/100x100/orange/white?text=Carrot" },
      { name: "Cauliflower", category: "Vegetable", price250: 25, price500: 48, price1kg: 90, image: "https://placehold.co/100x100/white/grey?text=Cauliflower" },
      { name: "Spinach", category: "Leafy", price250: 15, price500: 28, price1kg: 50, image: "https://placehold.co/100x100/green/white?text=Spinach" },
      { name: "Banana", category: "Fruit", price250: 20, price500: 38, price1kg: 70, image: "https://placehold.co/100x100/yellow/black?text=Banana" },
      { name: "Apple", category: "Fruit", price250: 40, price500: 75, price1kg: 140, image: "https://placehold.co/100x100/red/white?text=Apple" },
    ],
  });
  console.log("Products created:", products.count);

  const allProducts = await prisma.product.findMany();

  // Delivery Persons
  const dp1 = await prisma.deliveryPerson.create({
    data: {
      name: "Raju",
      phone: "9876543210",
      password: await bcrypt.hash("1234", 10),
      upiId: "raju@upi",
      active: true,
      zoneDeliveryPersons: {
        create: [
          { zone: { connect: { id: allZones[0].id } } },
          { zone: { connect: { id: allZones[1].id } } },
        ],
      },
    },
  });

  const dp2 = await prisma.deliveryPerson.create({
    data: {
      name: "Mohan",
      phone: "9876543211",
      password: await bcrypt.hash("1234", 10),
      upiId: "mohan@upi",
      active: true,
      zoneDeliveryPersons: {
        create: [
          { zone: { connect: { id: allZones[2].id } } },
          { zone: { connect: { id: allZones[3].id } } },
        ],
      },
    },
  });

  const dp3 = await prisma.deliveryPerson.create({
    data: {
      name: "Suresh",
      phone: "9876543212",
      password: await bcrypt.hash("1234", 10),
      upiId: "suresh@upi",
      active: true,
      zoneDeliveryPersons: {
        create: [
          { zone: { connect: { id: allZones[4].id } } },
          { zone: { connect: { id: allZones[0].id } } },
        ],
      },
    },
  });

  console.log("Delivery persons created:", 3);

  // Users
  const users = await prisma.user.createMany({
    data: [
      { name: "Amit Sharma", phone: "9123456789", zoneId: allZones[0].id, block: "A", building: "101", flat: "A1" },
      { name: "Priya Patel", phone: "9123456790", zoneId: allZones[1].id, block: "B", building: "202", flat: "B2" },
      { name: "Rahul Gupta", phone: "9123456791", zoneId: allZones[2].id, block: "C", building: "303", flat: "C3" },
      { name: "Sneha Verma", phone: "9123456792", zoneId: allZones[3].id, block: "D", building: "404", flat: "D4" },
      { name: "Vikas Rao", phone: "9123456793", zoneId: allZones[4].id, block: "E", building: "505", flat: "E5" },
      { name: "Neha Joshi", phone: "9123456794", zoneId: allZones[0].id, block: "F", building: "606", flat: "F6" },
      { name: "Deepak Kumar", phone: "9123456795", zoneId: allZones[1].id, block: "G", building: "707", flat: "G7" },
    ],
  });
  console.log("Users created:", users.count);

  const allUsers = await prisma.user.findMany();

  const dps = [dp1, dp2, dp3];

  // Orders
  const statuses = ["pending", "delivered", "failed"];
  const payments = ["cash", "online"];

  for (let i = 0; i < 15; i++) {
    const user = allUsers[i % allUsers.length];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const payment = payments[Math.floor(Math.random() * payments.length)];
    const numItems = Math.floor(Math.random() * 3) + 1;
    const orderItems = [];
    let total = 0;

    for (let j = 0; j < numItems; j++) {
      const product = allProducts[Math.floor(Math.random() * allProducts.length)];
      const variant = ["250g", "500g", "1kg"][Math.floor(Math.random() * 3)];
      const qty = Math.floor(Math.random() * 3) + 1;
      const price = variant === "250g" ? product.price250 : variant === "500g" ? product.price500 : product.price1kg;
      orderItems.push({ productId: product.id, variant, qty });
      total += price * qty;
    }

    // 70% orders ko random delivery person assign karo
    const assignDp = Math.random() < 0.7;
    const deliveryPersonId = assignDp ? dps[Math.floor(Math.random() * dps.length)].id : undefined;

    await prisma.order.create({
      data: {
        userId: user.id,
        zoneId: user.zoneId,
        total,
        status,
        payment,
        ...(deliveryPersonId ? { deliveryPersonId } : {}),
        items: { create: orderItems },
      },
    });
  }

  console.log("Orders created:", 15);

  console.log("\nSeed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
