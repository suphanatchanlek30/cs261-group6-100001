// components/location/BookingPanel.jsx
"use client";

import { useMemo, useState, useCallback } from "react";
import Swal from "sweetalert2";
import { checkUnitAvailability, createBooking } from "@/services/bookingService";
import { buildStartTimeISO } from "@/utils/date";
import { useRouter } from "next/navigation";

const HOURS_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function BookingPanel({ selectedUnit, onBooked }) {
  const [dateOnly, setDateOnly] = useState(""); // "YYYY-MM-DD"
  const [hour, setHour] = useState(12);         // 0..23
  const [hours, setHours] = useState(1);

  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState(null); // null | boolean
  const [msg, setMsg] = useState("");

  const router = useRouter();

  // คำนวณ startTime เป็น ISO-8601 (+offset ตามเครื่องผู้ใช้)
  const startTimeISO = useMemo(
    () => buildStartTimeISO(dateOnly, hour),
    [dateOnly, hour]
  );

  // ราคา/ชั่วโมง
  const pricePerHour = selectedUnit?.priceHourly ?? selectedUnit?.startingPriceHourly ?? 50;

  // รวมเงิน
  const total = useMemo(() => pricePerHour * Number(hours || 1), [pricePerHour, hours]);

  // reset state เมื่อมีการเปลี่ยนค่าเลือก
  const resetCheck = useCallback(() => {
    setAvailable(null);
    setMsg("");
  }, []);

  const onDateChange = useCallback((e) => {
    setDateOnly(e.target.value);
    resetCheck();
  }, [resetCheck]);

  const onHourChange = useCallback((e) => {
    setHour(Number(e.target.value));
    resetCheck();
  }, [resetCheck]);

  const onHoursChange = useCallback((e) => {
    setHours(Number(e.target.value));
    resetCheck();
  }, [resetCheck]);

  const handleCheck = useCallback(async () => {
    setMsg("");
    setAvailable(null);

    if (!selectedUnit?.id) return setMsg("กรุณาเลือกยูนิตก่อน");
    if (!dateOnly || hour == null) return setMsg("กรุณาเลือกวันที่และเวลาเริ่มต้น");
    if (Number(hours) < 1) return setMsg("จำนวนชั่วโมงต้องอย่างน้อย 1");

    setChecking(true);
    try {
      const result = await checkUnitAvailability({
        unitId: selectedUnit.id,
        startTime: startTimeISO,
        hours: Number(hours),
      });
      setAvailable(Boolean(result.available));
      setMsg(result.message || (result.available ? "พื้นที่ว่าง สามารถจองได้" : "ไม่ว่าง"));
    } finally {
      setChecking(false);
    }
  }, [selectedUnit?.id, dateOnly, hour, hours, startTimeISO]);

  const handleBook = useCallback(async () => {
    setMsg("");

    if (!selectedUnit?.id) return setMsg("กรุณาเลือกยูนิตก่อน");
    if (!startTimeISO) return setMsg("กรุณาเลือกวันและเวลาเริ่มต้น");
    if (available !== true) return setMsg("กรุณาเช็คสถานะให้ 'ว่าง' ก่อนทำการจอง");

    // ----- SweetAlert2: แสดงยืนยันก่อนจอง -----
    const start = new Date(startTimeISO);
    const end = new Date(startTimeISO);
    end.setHours(end.getHours() + Number(hours || 1));

    const fmtDate = start.toLocaleDateString("th-TH", { day: "2-digit", month: "2-digit", year: "numeric" });
    const fmtStart = start.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", hour12: false });
    const fmtEnd = end.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", hour12: false });

    const html = `
      <div style="text-align:left">
        <div><b>Unit:</b> ${selectedUnit?.code ? `${selectedUnit.code} - ` : ""}${selectedUnit?.name || "-"}</div>
        <div><b>Date:</b> ${fmtDate}</div>
        <div><b>Time:</b> ${fmtStart} - ${fmtEnd} (${hours} hour${Number(hours) > 1 ? "s" : ""})</div>
        <div><b>Rate:</b> ${pricePerHour} Baht/hour</div>
        <div><b>Total:</b> <span style="color:#7C3AED;font-weight:700">${total} Baht</span></div>
      </div>
    `;

    const confirm = await Swal.fire({
      title: "Confirm booking",
      html,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Book this unit",
      cancelButtonText: "Edit",
      reverseButtons: true,
      focusCancel: true,
    });

    if (!confirm.isConfirmed) return;

    // ----- สร้างการจอง -----
    const payload = {
      unitId: selectedUnit.id,
      startTime: startTimeISO,
      hours: Number(hours || 1),
    };

    const { ok, data, message } = await createBooking(payload);
    if (!ok) {
      setAvailable(false);
      setMsg(message || "จองไม่สำเร็จ");
      await Swal.fire({
        title: "Booking failed",
        text: message || "ไม่สามารถจองได้",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    setAvailable(true);
    setMsg("จองสำเร็จ");
    await Swal.fire({
      title: "Booked!",
      html,
      icon: "success",
      confirmButtonText: "OK",
    });

    // ไปหน้า My booking
    router.push("/my-booking");
    onBooked?.(data);
  }, [available, hours, pricePerHour, selectedUnit, startTimeISO, total, onBooked]);

  const readyToCheck = Boolean(selectedUnit?.id && dateOnly && hour !== null);
  const canBook = Boolean(selectedUnit?.id) && available === true;

  return (
    <aside className="rounded-[14px] border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-neutral-900">Choose booking date and start time</h3>

      <div className="mt-3 space-y-3">
        {/* Date */}
        <div className="flex flex-col gap-1">
          <label htmlFor="booking-date" className="text-xs text-neutral-600">Date</label>
          <input
            id="booking-date"
            type="date"
            value={dateOnly}
            onChange={onDateChange}
            className="h-10 rounded-[10px] border border-gray-300 px-3 text-sm"
          />
        </div>

        {/* Hour */}
        <div className="flex flex-col gap-1">
          <label htmlFor="booking-hour" className="text-xs text-neutral-600">Start time (HH:00)</label>
          <select
            id="booking-hour"
            value={hour}
            onChange={onHourChange}
            className="h-10 rounded-[10px] border border-gray-300 px-3 text-sm"
          >
            {Array.from({ length: 24 }).map((_, h) => (
              <option key={h} value={h}>
                {String(h).padStart(2, "0")}:00
              </option>
            ))}
          </select>
        </div>

        {/* Hours */}
        <div className="flex flex-col gap-1">
          <label htmlFor="booking-hours" className="text-xs text-neutral-600">Number of hours</label>
          <select
            id="booking-hours"
            value={hours}
            onChange={onHoursChange}
            className="h-10 rounded-[10px] border border-gray-300 px-3 text-sm"
          >
            {HOURS_OPTIONS.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </div>

        {/* Check availability */}
        <button
          type="button"
          onClick={handleCheck}
          disabled={!readyToCheck || checking}
          className="w-full h-10 rounded-[10px] bg-white border border-violet-500 text-violet-700 font-semibold hover:bg-violet-50 disabled:opacity-50"
        >
          {checking ? "Checking..." : "Check availability"}
        </button>

        {/* Total */}
        <div className="rounded-[12px] bg-violet-50 px-3 py-2 text-sm font-semibold text-violet-700">
          Total: {total} Baht
        </div>

        {/* Book */}
        <button
          type="button"
          onClick={handleBook}
          disabled={!canBook}
          className="w-full h-10 rounded-[10px] bg-[#7C3AED] text-white font-semibold shadow-[0_8px_20px_rgba(124,58,237,.28)] hover:bg-[#6D28D9] disabled:opacity-50"
        >
          Book this unit
        </button>

        {/* Message */}
        {msg && (
          <div
            className={[
              "text-sm mt-1",
              available ? "text-emerald-600" : "text-red-600",
            ].join(" ")}
            role="status"
            aria-live="polite"
          >
            {msg}
          </div>
        )}
      </div>
    </aside>
  );
}
