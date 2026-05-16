import "dotenv/config";

const GHN_BASE = process.env.GHN_BASE_URL || "https://dev-online-gateway.ghn.vn/shiip/public-api";
const TOKEN = process.env.GHN_TOKEN!;

(async () => {
  const res = await fetch(`${GHN_BASE}/master-data/ward?district_id=1526`, {
    headers: { Token: TOKEN, "Content-Type": "application/json" },
  });
  const data = await res.json();
  if (data.code !== 200) { console.error(data); return; }
  console.log(`Wards in district 1526 (Hải Châu):`);
  for (const w of data.data) {
    console.log(`  ${w.WardCode}\t${w.WardName}`);
  }
})();
