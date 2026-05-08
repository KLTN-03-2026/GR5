import { NextResponse } from "next/server";

const GHN_BASE = process.env.GHN_BASE_URL || "https://dev-online-gateway.ghn.vn/shiip/public-api";
const GHN_TOKEN = process.env.GHN_TOKEN || "";

function ghnHeaders() {
  return { Token: GHN_TOKEN, "Content-Type": "application/json" };
}

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type"); // province | district | ward
  const districtId = searchParams.get("district_id");
  const provinceId = searchParams.get("province_id");

  try {
    if (type === "province") {
      const res = await fetch(`${GHN_BASE}/master-data/province`, {
        headers: ghnHeaders(),
        cache: "force-cache",
      });
      const data = await res.json();
      return NextResponse.json(data.data || []);
    }

    if (type === "district" && provinceId) {
      const res = await fetch(`${GHN_BASE}/master-data/district`, {
        method: "POST",
        headers: ghnHeaders(),
        body: JSON.stringify({ province_id: Number(provinceId) }),
        cache: "force-cache",
      });
      const data = await res.json();
      return NextResponse.json(data.data || []);
    }

    if (type === "ward" && districtId) {
      const res = await fetch(`${GHN_BASE}/master-data/ward`, {
        method: "POST",
        headers: ghnHeaders(),
        body: JSON.stringify({ district_id: Number(districtId) }),
        cache: "force-cache",
      });
      const data = await res.json();
      return NextResponse.json(data.data || []);
    }

    return NextResponse.json({ error: "Thiếu tham số type hoặc id" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
