"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Boxes,
  ChevronRight,
  Circle,
  Layers3,
  RefreshCw,
  ScanLine,
  Warehouse,
} from "lucide-react";

type Batch = {
  id: number;
  ma_lo_hang: string;
  san_pham: string;
  so_luong: number;
  han_su_dung: string;
  days_left: number | null;
  warning: boolean;
  vi_tri: string;
  ncc: string | null;
  ma_bien_the: number | null;
};

type Floor = {
  id: number;
  tang: string;
  capacity: number;
  current: number;
  percent: number;
  expiringSoon: boolean;
  so_luong_ton: number;
  batches: Batch[];
};

type Shelf = {
  name: string;
  floors: Floor[];
};

type Day = {
  name: string;
  shelves: Shelf[];
};

type Zone = {
  name: string;
  totalCapacity: number;
  totalCurrent: number;
  expiringSoon: number;
  days: Day[];
};

type WarehouseMapResponse = {
  zones: Zone[];
  stats: {
    totalBoxes: number;
    expiringBoxes: number;
    zonesCount: number;
  };
};

function getCapacityColor(percent: number) {
  if (percent > 90) return "bg-red-500";
  if (percent > 75) return "bg-amber-500";
  return "bg-emerald-500";
}

function getFloorBadge(percent: number) {
  if (percent > 90) return "Sắp đầy";
  if (percent > 75) return "Cần theo dõi";
  return "Đang an toàn";
}

export default function WarehouseMapView() {
  const [data, setData] = useState<WarehouseMapResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedZoneIndex, setSelectedZoneIndex] = useState(0);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [selectedShelfIndex, setSelectedShelfIndex] = useState(0);
  const [selectedFloor, setSelectedFloor] = useState<Floor | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/warehouse/map", {
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error("Không thể tải sơ đồ kho");
      }

      const json = (await response.json()) as WarehouseMapResponse;
      setData(json);
      setSelectedZoneIndex(0);
      setSelectedDayIndex(0);
      setSelectedShelfIndex(0);
      setSelectedFloor(null);
    } catch (err: any) {
      setError(err?.message || "Không thể tải sơ đồ kho");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const zones = data?.zones || [];
  const selectedZone = zones[selectedZoneIndex] || null;
  const selectedDay = selectedZone?.days[selectedDayIndex] || null;
  const selectedShelf = selectedDay?.shelves[selectedShelfIndex] || null;

  const floorStats = useMemo(() => {
    const floors = selectedShelf?.floors || [];
    return {
      floorCount: floors.length,
      totalCurrent: floors.reduce((sum, floor) => sum + floor.current, 0),
      totalCapacity: floors.reduce((sum, floor) => sum + floor.capacity, 0),
    };
  }, [selectedShelf]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          icon={<Warehouse className="h-5 w-5" />}
          label="Khu đang theo dõi"
          value={data?.stats.zonesCount ?? 0}
        />
        <StatCard
          icon={<Boxes className="h-5 w-5" />}
          label="Kiện trong kho"
          value={data?.stats.totalBoxes ?? 0}
        />
        <StatCard
          icon={<AlertTriangle className="h-5 w-5" />}
          label="Lô gần hết hạn"
          value={data?.stats.expiringBoxes ?? 0}
        />
        <StatCard
          icon={<ScanLine className="h-5 w-5" />}
          label="Tầng đã mở"
          value={floorStats.floorCount}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <section className="rounded-3xl border border-white/70 bg-white/95 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Bản đồ kho
              </h2>
              <p className="text-sm text-slate-500">
                Click theo khu, dãy, kệ, tầng để drill down tới từng lô.
              </p>
            </div>
            <button
              type="button"
              onClick={loadData}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <RefreshCw className="h-4 w-4" />
              Làm mới
            </button>
          </div>

          {loading ? (
            <div className="grid min-h-[280px] place-items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-slate-500">
              Đang tải sơ đồ kho...
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : zones.length === 0 ? (
            <div className="grid min-h-[280px] place-items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-slate-500">
              Chưa có dữ liệu vị trí kho.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {zones.map((zone, index) => {
                  const percent =
                    zone.totalCapacity > 0
                      ? Math.round(
                          (zone.totalCurrent / zone.totalCapacity) * 100,
                        )
                      : 0;
                  const active = index === selectedZoneIndex;

                  return (
                    <button
                      key={zone.name}
                      type="button"
                      onClick={() => {
                        setSelectedZoneIndex(index);
                        setSelectedDayIndex(0);
                        setSelectedShelfIndex(0);
                        setSelectedFloor(null);
                      }}
                      className={`rounded-2xl border p-4 text-left transition ${active ? "border-emerald-700 bg-emerald-700 text-white shadow-lg" : "border-slate-200 bg-white hover:border-emerald-300 hover:shadow-sm"}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div className="text-lg font-semibold">
                            {zone.name}
                          </div>
                          <div
                            className={`mt-1 text-sm ${active ? "text-emerald-100" : "text-slate-500"}`}
                          >
                            {zone.days.length} dãy
                          </div>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"}`}
                        >
                          {percent}%
                        </span>
                      </div>
                      <div className="mt-4 h-2 rounded-full bg-slate-200/70">
                        <div
                          className={`h-2 rounded-full ${getCapacityColor(percent)}`}
                          style={{ width: `${Math.min(percent, 100)}%` }}
                        />
                      </div>
                      <div
                        className={`mt-3 flex items-center justify-between text-sm ${active ? "text-emerald-100" : "text-slate-500"}`}
                      >
                        <span>
                          {zone.totalCurrent}/{zone.totalCapacity}
                        </span>
                        <span>{zone.expiringSoon} lô sắp hết hạn</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedZone && (
                <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                    <span className="font-semibold text-slate-900">
                      {selectedZone.name}
                    </span>
                    <ChevronRight className="h-4 w-4" />
                    <span>{selectedDay?.name ?? "Dãy"}</span>
                    <ChevronRight className="h-4 w-4" />
                    <span>{selectedShelf?.name ?? "Kệ"}</span>
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    {selectedZone.days.map((day, dayIndex) => (
                      <button
                        type="button"
                        key={day.name}
                        onClick={() => {
                          setSelectedDayIndex(dayIndex);
                          setSelectedShelfIndex(0);
                          setSelectedFloor(null);
                        }}
                        className={`rounded-2xl border px-4 py-3 text-left transition ${dayIndex === selectedDayIndex ? "border-emerald-700 bg-emerald-700 text-white" : "border-slate-200 bg-white hover:border-emerald-300"}`}
                      >
                        <div className="text-sm font-semibold">{day.name}</div>
                        <div
                          className={`mt-1 text-xs ${dayIndex === selectedDayIndex ? "text-emerald-100" : "text-slate-500"}`}
                        >
                          {day.shelves.length} kệ
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {selectedDay?.shelves.map((shelf, shelfIndex) => (
                      <button
                        type="button"
                        key={shelf.name}
                        onClick={() => {
                          setSelectedShelfIndex(shelfIndex);
                          setSelectedFloor(null);
                        }}
                        className={`rounded-2xl border px-4 py-3 text-left transition ${shelfIndex === selectedShelfIndex ? "border-sky-600 bg-sky-50" : "border-slate-200 bg-white hover:border-slate-300"}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-900">
                            {shelf.name}
                          </span>
                          <Layers3 className="h-4 w-4 text-slate-400" />
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {shelf.floors.length} tầng
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {selectedShelf?.floors.map((floor) => {
                      const badge = getFloorBadge(floor.percent);

                      return (
                        <button
                          type="button"
                          key={floor.id}
                          onClick={() => setSelectedFloor(floor)}
                          className="rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-slate-300 hover:shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <Circle
                                  className={`h-3 w-3 fill-current ${floor.percent > 90 ? "text-red-500" : floor.percent > 75 ? "text-amber-500" : "text-emerald-500"}`}
                                />
                                <span className="font-semibold text-slate-900">
                                  Tầng {floor.tang}
                                </span>
                              </div>
                              <div className="mt-1 text-xs text-slate-500">
                                {badge}
                              </div>
                            </div>
                            <div className="text-right text-sm font-semibold text-slate-900">
                              {floor.percent}%
                            </div>
                          </div>
                          <div className="mt-4 h-2 rounded-full bg-slate-100">
                            <div
                              className={`h-2 rounded-full ${getCapacityColor(floor.percent)}`}
                              style={{
                                width: `${Math.min(floor.percent, 100)}%`,
                              }}
                            />
                          </div>
                          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                            <span>
                              {floor.current}/{floor.capacity}
                            </span>
                            <span>{floor.so_luong_ton} lô</span>
                          </div>
                          {floor.expiringSoon && (
                            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                              <AlertTriangle className="h-3.5 w-3.5" />
                              Có lô sắp hết hạn
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        <aside className="space-y-4 rounded-3xl border border-emerald-800 bg-emerald-900 p-5 text-white shadow-[0_24px_80px_rgba(5,80,40,0.25)]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-100">
              <Warehouse className="h-3.5 w-3.5" />
              Drilldown
            </div>
            <h3 className="mt-4 text-2xl font-semibold">
              Chi tiết vị trí đang chọn
            </h3>
            <p className="mt-2 text-sm text-emerald-200">
              Dữ liệu lô hàng, sản phẩm và ngày hết hạn sẽ đi từ tầng đã chọn.
            </p>
          </div>

          {!selectedZone ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              Chưa có vị trí nào được chọn.
            </div>
          ) : (
            <>
              <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-emerald-100">
                <div className="flex items-center justify-between gap-3">
                  <span>Khu</span>
                  <span className="font-semibold text-white">
                    {selectedZone.name}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Dãy</span>
                  <span className="font-semibold text-white">
                    {selectedDay?.name ?? "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Kệ</span>
                  <span className="font-semibold text-white">
                    {selectedShelf?.name ?? "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Tầng</span>
                  <span className="font-semibold text-white">
                    {selectedFloor?.tang ?? "-"}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between text-sm text-emerald-200">
                  <span>Tầng đang xem</span>
                  <span className="font-semibold text-white">
                    {selectedShelf?.floors.length ?? 0} tầng
                  </span>
                </div>
                <div className="mt-3 flex items-end justify-between">
                  <div>
                    <div className="text-3xl font-bold text-white">
                      {floorStats.totalCurrent}
                    </div>
                    <div className="text-sm text-emerald-200">
                      Tổng số lượng trên kệ
                    </div>
                  </div>
                  <div className="text-right text-sm text-emerald-200">
                    <div className="font-semibold text-white">
                      {floorStats.totalCapacity}
                    </div>
                    <div>Máy tính sức chứa</div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
                  Lô hiện có
                </div>
                {selectedFloor ? (
                  <div className="space-y-3">
                    {selectedFloor.batches.map((batch) => (
                      <div
                        key={batch.id}
                        className="rounded-2xl border border-white/10 bg-slate-900/60 p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-semibold text-white">
                              {batch.san_pham}
                            </div>
                            <div className="mt-1 text-xs text-slate-300">
                              {batch.ma_lo_hang}
                            </div>
                          </div>
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${batch.warning ? "bg-amber-500/20 text-amber-200" : "bg-emerald-500/20 text-emerald-200"}`}
                          >
                            {batch.days_left === null
                              ? "Không rõ HSD"
                              : `${batch.days_left} ngày`}
                          </span>
                        </div>
                        <div className="mt-3 grid gap-2 text-xs text-slate-300 sm:grid-cols-2">
                          <div>
                            Số lượng:{" "}
                            <span className="font-semibold text-white">
                              {batch.so_luong}
                            </span>
                          </div>
                          <div>
                            HSD:{" "}
                            <span className="font-semibold text-white">
                              {batch.han_su_dung}
                            </span>
                          </div>
                          <div>
                            Vị trí:{" "}
                            <span className="font-semibold text-white">
                              {batch.vi_tri}
                            </span>
                          </div>
                          <div>
                            NCC:{" "}
                            <span className="font-semibold text-white">
                              {batch.ncc ?? "-"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {selectedFloor.batches.length === 0 && (
                      <div className="text-sm text-slate-300">
                        Tầng này chưa có lô hàng.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-emerald-200">
                    Chọn một tầng để xem danh sách lô hàng.
                  </div>
                )}
              </div>
            </>
          )}
        </aside>
      </div>

      {selectedFloor && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-4 backdrop-blur sm:items-center">
          <div className="w-full max-w-3xl rounded-3xl border border-white/10 bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h4 className="text-lg font-semibold text-slate-900">
                  {selectedFloor.tang} - chi tiết lô
                </h4>
                <p className="text-sm text-slate-500">
                  Danh sách lô nằm tại tầng này, có cờ cảnh báo nếu gần hết hạn.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFloor(null)}
                className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Đóng
              </button>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {selectedFloor.batches.map((batch) => (
                <div
                  key={batch.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-slate-900">
                        {batch.san_pham}
                      </div>
                      <div className="text-xs text-slate-500">
                        {batch.ma_lo_hang}
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${batch.warning ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}
                    >
                      {batch.warning ? "Cảnh báo" : "Ổn định"}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-slate-600">
                    <div>
                      Số lượng:{" "}
                      <span className="font-semibold text-slate-900">
                        {batch.so_luong}
                      </span>
                    </div>
                    <div>
                      HSD:{" "}
                      <span className="font-semibold text-slate-900">
                        {batch.han_su_dung}
                      </span>
                    </div>
                    <div>
                      Ngày còn lại:{" "}
                      <span className="font-semibold text-slate-900">
                        {batch.days_left ?? "N/A"}
                      </span>
                    </div>
                    <div>
                      NCC:{" "}
                      <span className="font-semibold text-slate-900">
                        {batch.ncc ?? "-"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-3xl border border-white/70 bg-white/95 p-4 shadow-[0_16px_50px_rgba(15,23,42,0.06)] backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm text-slate-500">{label}</div>
          <div className="mt-2 text-3xl font-bold text-slate-950">{value}</div>
        </div>
        <div className="rounded-2xl bg-emerald-700 p-3 text-white">{icon}</div>
      </div>
    </div>
  );
}
