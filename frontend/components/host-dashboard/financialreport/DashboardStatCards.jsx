"use client";
import { formatTHB } from "../../../utils/format";
import { HiBuildingOffice2 } from "react-icons/hi2";
import { FaSackDollar } from "react-icons/fa6";
import { MdPendingActions } from "react-icons/md";
import { FaCheckCircle } from "react-icons/fa";

export default function DashboardStatCards({ cards = {}, loading }) {
  const locationsTotal = Number(cards.locationsTotal ?? 0);
  const pendingReview = Number(cards.pendingReview ?? 0);
  const approved = Number(cards.approved ?? 0);
  const todayIncome = Number(cards.todayIncome ?? 0);

  const items = [
    { label: "Total Locations", value: locationsTotal, Icon: HiBuildingOffice2 },
    { label: "Pending Review", value: pendingReview, Icon: MdPendingActions },
    { label: "Approved", value: approved, Icon: FaCheckCircle },
    { label: "Today Income", value: formatTHB(todayIncome), Icon: FaSackDollar },
  ];
  return (
    <section className="grid gap-4 md:grid-cols-4">
      {items.map(({ label, value, Icon }) => (
        <div key={label} className="flex items-center gap-4 rounded-xl bg-white px-6 py-4 shadow-sm border border-slate-200 hover:shadow-md transition-all">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F3E4FF] text-[#7C3AED]">
            <Icon size={22} />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-semibold text-slate-900">{loading ? <Skeleton /> : value}</span>
            <span className="text-sm text-slate-900">{label}</span>
          </div>
        </div>
      ))}
    </section>
  );
}

function Skeleton(){
  return <span className="inline-block h-6 w-20 rounded bg-neutral-200 animate-pulse"/>;
}
