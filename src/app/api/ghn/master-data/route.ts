import { NextResponse } from "next/server";

const GHN_BASE = process.env.GHN_BASE_URL || "https://dev-online-gateway.ghn.vn/shiip/public-api";
const GHN_TOKEN = process.env.GHN_TOKEN!;

export const dynamic = "force-dynamic";

async function ghnFetch(endpoint: string, body?: any) {
  const res = await fetch(`${GHN_BASE}${endpoint}`, {
    method: "POST",
    headers: {
      Token: GHN_TOKEN,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const districtId = searchParams.get("district_id");
  const provinceId = searchParams.get("province_id");

  try {
    if (type === "province") {
      const data = await ghnFetch("/master-data/province");
      if (data.code !== 200) return NextResponse.json({ error: data.message }, { status: 502 });
      return NextResponse.json(
        data.data.map((p: any) => ({
          ProvinceID: p.ProvinceID,
          ProvinceName: p.ProvinceName,
        }))
      );
    }

    if (type === "district" && provinceId) {
      const data = await ghnFetch("/master-data/district", { province_id: Number(provinceId) });
      if (data.code !== 200) return NextResponse.json({ error: data.message }, { status: 502 });
      return NextResponse.json(
        data.data.map((d: any) => ({
          DistrictID: d.DistrictID,
          DistrictName: d.DistrictName,
        }))
      );
    }

    if (type === "ward" && districtId) {
      const data = await ghnFetch("/master-data/ward", { district_id: Number(districtId) });
      if (data.code !== 200) return NextResponse.json({ error: data.message }, { status: 502 });
      return NextResponse.json(
        data.data.map((w: any) => ({
          WardCode: w.WardCode,
          WardName: w.WardName,
        }))
      );
    }

    return NextResponse.json({ error: "Thiếu tham số type hoặc id" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
