const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const alerts = await prisma.canh_bao_lo_hang.findMany({ include: { lo_hang: { include: { bien_the_san_pham: { include: { san_pham: true } } } } } });
  console.log(JSON.stringify(alerts, null, 2));
}

main().catch(console.error).finally(()=>prisma.$disconnect());
