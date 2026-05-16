import "dotenv/config";

const GHN_BASE = process.env.GHN_BASE_URL || "https://dev-online-gateway.ghn.vn/shiip/public-api";
const TOKEN = process.env.GHN_TOKEN!;

(async () => {
  // Đà Nẵng province_id = 203
  const res = await fetch(`${GHN_BASE}/master-data/district`, {
    method: "POST",
    headers: { Token: TOKEN, "Content-Type": "application/json" },
    body: JSON.stringify({ province_id: 203 }),
  });
  const data = await res.json();
  if (data.code !== 200) { console.error(data); return; }
  console.log("Districts in Đà Nẵng (province 203):");
  for (const d of data.data) {
    console.log(`  ${d.DistrictID}\t${d.DistrictName}`);
  }
})();
