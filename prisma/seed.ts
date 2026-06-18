import { PrismaClient, type Product } from "@prisma/client";
import Decimal from "decimal.js";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Admin
  const hashedPassword = await bcrypt.hash("admin123", 12);
  await prisma.admin.upsert({
    where: { email: "admin@salesms.com" },
    update: {},
    create: {
      email: "admin@salesms.com",
      password: hashedPassword,
      name: "Admin User",
    },
  });

  // Business Stats
  const existingStats = await prisma.businessStats.findFirst();
  if (!existingStats) {
    await prisma.businessStats.create({
      data: {
        initialCapital: new Decimal(500000),
        totalNetProfit: new Decimal(0),
        presentValue: new Decimal(500000),
      },
    });
  }

  // Products
  const productData = [
    // Water
    { name: "Bigi Water 75cl x12", category: "Water" },
    { name: "Bigi Water 150cl x12", category: "Water" },
    { name: "Eva Water 75cl x12", category: "Water" },
    { name: "Ragolis Water 75cl x12", category: "Water" },
    { name: "Swan Water 75cl x12", category: "Water" },

    // Carbonated Drink
    { name: "Coca-Cola 50cl x12", category: "Carbonated Drink" },
    { name: "Bigi Cola 60cl x12", category: "Carbonated Drink" },
    { name: "Pepsi 50cl x12", category: "Carbonated Drink" },
    { name: "Mirinda Orange 50cl x12", category: "Carbonated Drink" },
    { name: "Fanta Orange 50cl x12", category: "Carbonated Drink" },
    { name: "Sprite 50cl x12", category: "Carbonated Drink" },
    { name: "7UP 50cl x12", category: "Carbonated Drink" },
    { name: "Bigi Bitter Lemon 60cl x12", category: "Carbonated Drink" },
    { name: "Bigi Tropical 60cl x12", category: "Carbonated Drink" },

    // Energy Drink
    { name: "Power Horse 25cl x24", category: "Energy Drink" },
    { name: "Bullet Energy Drink 25cl x24", category: "Energy Drink" },
    { name: "Fearless Energy Drink 50cl x12", category: "Energy Drink" },
    { name: "Predator Energy Drink 50cl x12", category: "Energy Drink" },

    // Fruit Drink
    { name: "Five Alive Pulpy 85cl x6", category: "Fruit Drink" },
    { name: "Five Alive Berry Blast 85cl x6", category: "Fruit Drink" },
    { name: "Smoov Fruit Drink 85cl x6", category: "Fruit Drink" },
    { name: "Capri-Sun Orange 20cl x40", category: "Fruit Drink" },

    // Juice
    { name: "Chi Exotic Mango 42cl x12", category: "Juice" },
    { name: "Chi Exotic Pineapple 42cl x12", category: "Juice" },
    { name: "Hollandia Fruit Juice Orange 35cl x12", category: "Juice" },
    { name: "Chivita 100% Orange Juice 1L x12", category: "Juice" },
    { name: "Richoco Juice 35cl x12", category: "Juice" },

    // Yoghurt
    { name: "Hollandia Yoghurt Strawberry 1L x6", category: "Yoghurt" },
    { name: "Hollandia Yoghurt Plain 1L x6", category: "Yoghurt" },
    { name: "Lacto Yoghurt Strawberry 90g x20", category: "Yoghurt" },
    { name: "Lacto Yoghurt Vanilla 90g x20", category: "Yoghurt" },
    { name: "Danone Yoghurt Strawberry 385g x12", category: "Yoghurt" },
  ];

  const products: Product[] = [];
  for (const p of productData) {
    const slugId = `seed-${p.name.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}`;
    const product = await prisma.product.upsert({
      where: { id: slugId },
      update: {},
      create: {
        id: slugId,
        name: p.name,
        category: p.category,
      },
    });
    products.push(product);
  }

  console.log(`✅ Created ${products.length} products`);

  // Sales data — realistic Nigerian beverage distributor pricing (per carton, NGN)
  const salesData = [
    { productIdx: 0,  qty: 20, cost: 1100,  sell: 1400  }, // Bigi Water 75cl x12
    { productIdx: 1,  qty: 10, cost: 1800,  sell: 2200  }, // Bigi Water 150cl x12
    { productIdx: 2,  qty: 15, cost: 1400,  sell: 1750  }, // Eva Water 75cl
    { productIdx: 3,  qty: 12, cost: 1350,  sell: 1700  }, // Ragolis Water
    { productIdx: 5,  qty: 10, cost: 3200,  sell: 4000  }, // Coca-Cola 50cl x12
    { productIdx: 6,  qty: 25, cost: 1800,  sell: 2400  }, // Bigi Cola
    { productIdx: 7,  qty: 8,  cost: 3000,  sell: 3800  }, // Pepsi
    { productIdx: 8,  qty: 10, cost: 2800,  sell: 3500  }, // Mirinda
    { productIdx: 9,  qty: 10, cost: 2900,  sell: 3600  }, // Fanta
    { productIdx: 10, qty: 8,  cost: 2800,  sell: 3500  }, // Sprite
    { productIdx: 14, qty: 30, cost: 2200,  sell: 2800  }, // Power Horse
    { productIdx: 15, qty: 20, cost: 2000,  sell: 2600  }, // Bullet
    { productIdx: 18, qty: 15, cost: 2500,  sell: 3200  }, // Five Alive Pulpy
    { productIdx: 19, qty: 12, cost: 2500,  sell: 3200  }, // Five Alive Berry
    { productIdx: 22, qty: 18, cost: 2800,  sell: 3500  }, // Chi Exotic Mango
    { productIdx: 23, qty: 15, cost: 2800,  sell: 3500  }, // Chi Exotic Pineapple
    { productIdx: 24, qty: 10, cost: 3200,  sell: 4000  }, // Hollandia Juice
    { productIdx: 27, qty: 12, cost: 4500,  sell: 5500  }, // Hollandia Yoghurt Strawberry
    { productIdx: 28, qty: 10, cost: 4200,  sell: 5200  }, // Hollandia Yoghurt Plain
    { productIdx: 29, qty: 25, cost: 1800,  sell: 2300  }, // Lacto Yoghurt
  ];

  let totalProfit = new Decimal(0);
  let salesCount = 0;

  for (let monthOffset = 5; monthOffset >= 0; monthOffset--) {
    const numSales = Math.floor(Math.random() * 3) + 2;

    for (let s = 0; s < numSales; s++) {
      const day = Math.floor(Math.random() * 28) + 1;
      const date = new Date();
      date.setMonth(date.getMonth() - monthOffset);
      date.setDate(day);

      const itemsInSale = Math.floor(Math.random() * 4) + 1;
      const shuffled = [...salesData]
        .sort(() => Math.random() - 0.5)
        .slice(0, itemsInSale);

      let saleTotalAmount = new Decimal(0);
      let saleTotalProfit = new Decimal(0);

      const items = shuffled.map((sd) => {
        const profit = (sd.sell - sd.cost) * sd.qty;
        const amount = sd.sell * sd.qty;
        saleTotalAmount = saleTotalAmount.plus(amount);
        saleTotalProfit = saleTotalProfit.plus(profit);
        return {
          productId: products[sd.productIdx].id,
          quantity: sd.qty,
          costPrice: new Decimal(sd.cost),
          sellingPrice: new Decimal(sd.sell),
          profit: new Decimal(profit),
        };
      });

      await prisma.sale.create({
        data: {
          totalAmount: saleTotalAmount,
          totalProfit: saleTotalProfit,
          createdAt: date,
          items: { create: items },
        },
      });

      totalProfit = totalProfit.plus(saleTotalProfit);
      salesCount++;
    }
  }

  console.log(`✅ Created ${salesCount} sales`);

  // Update business stats
  const stats = await prisma.businessStats.findFirst();
  if (stats) {
    await prisma.businessStats.update({
      where: { id: stats.id },
      data: {
        totalNetProfit: totalProfit,
        totalExpenditure: new Decimal(0),
        presentValue: new Decimal(500000).plus(totalProfit),
      },
    });
  }

  console.log("✅ Updated business stats");
  console.log("");
  console.log("🎉 Seeding complete!");
 
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
