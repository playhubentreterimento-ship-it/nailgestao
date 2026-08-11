import { seedDatabase } from "../src/lib/seed-data";

async function main() {
  await seedDatabase();
}

main()
  .catch((e) => {
    console.error("❌ Erro ao executar seed:", e);
    process.exit(1);
  });
