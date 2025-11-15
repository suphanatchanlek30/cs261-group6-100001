"use client";

import { useEffect, useMemo, useState } from "react";
import { getHostBookings, getHostBooking } from "@/services/hostBookingService";
import { getMyLocations, getMyLocationDetail } from "@/services/hostlocationService";
import Pagination from "@/components/common/Pagination";
import BookingFilters from "./BookingFilters";
import BookingsTable from "./BookingsTable";
import BookingsCards from "./BookingsCards";
import BookingDetailModal from "./BookingDetailModal";
import { formatTHB } from "./timeHelpers";

export default function HostBookingsView() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ content: [], number: 0, totalPages: 1, size: 10, totalElements: 0 });

  // filters
  const [status, setStatus] = useState("");
  const [locations, setLocations] = useState([]);
  const [locationId, setLocationId] = useState("");
  const [units, setUnits] = useState([]);
  const [unitId, setUnitId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  // detail modal
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);

  function clearFilters() {
    setStatus("");
    setLocationId("");
    setUnitId("");
    setFromDate("");
    setToDate("");
    setPage(0);
  }

  useEffect(() => {
    // load locations for filter
    (async () => {
      const { ok, data } = await getMyLocations();
      if (ok) setLocations(data.items || []);
    })();
  }, []);

  useEffect(() => {
    // when location changes, load its units for unit filter
    (async () => {
      setUnits([]);
      setUnitId("");
      if (!locationId) return;
      const { ok, data } = await getMyLocationDetail(locationId);
      if (ok) setUnits(data.units || []);
    })();
  }, [locationId]);

  const queryParams = useMemo(() => {
    const params = { page, size };
    if (status) params.status = status;
    if (locationId) params.locationId = locationId;
    if (unitId) params.unitId = unitId;
    if (fromDate) params.from = `${fromDate}T00:00:00`;
    if (toDate) params.to = `${toDate}T23:59:59`;
    return params;
  }, [status, locationId, unitId, fromDate, toDate, page, size]);

  async function load() {
    setLoading(true);
    const res = await getHostBookings(queryParams);
    if (res.ok) setData(res.data);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams]);

  async function openBookingDetail(id) {
    setSelectedId(id);
    setOpenDetail(true);
    setDetail(null);
    const { ok, data } = await getHostBooking(id);
    if (ok) setDetail(data);
  }

  return (
    <div className="space-y-5">
      {/* Filters */}
      <BookingFilters
        status={status}
        locationId={locationId}
        unitId={unitId}
        fromDate={fromDate}
        toDate={toDate}
        locations={locations}
        units={units}
        onChangeStatus={(v) => { setPage(0); setStatus(v); }}
        onChangeLocation={(v) => { setPage(0); setLocationId(v); }}
        onChangeUnit={(v) => { setPage(0); setUnitId(v); }}
        onChangeFrom={(v) => { setPage(0); setFromDate(v); }}
        onChangeTo={(v) => { setPage(0); setToDate(v); }}
        onClear={clearFilters}
      />

      {/* Table (desktop) */}
      <BookingsTable items={data.content || []} loading={loading} onRowClick={openBookingDetail} />

      {/* Cards (mobile) */}
      <BookingsCards items={data.content || []} loading={loading} onCardClick={openBookingDetail} />

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          รวม {data.totalElements || 0} รายการ · หน้า {data.number + 1} / {Math.max(1, data.totalPages || 1)}
        </div>
        <Pagination page={data.number || 0} totalPages={Math.max(1, data.totalPages || 1)} onPageChange={setPage} />
      </div>

      <BookingDetailModal open={openDetail} onClose={() => setOpenDetail(false)} booking={detail} />
    </div>
  );
}
