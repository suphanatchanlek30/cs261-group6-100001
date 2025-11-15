"use client";
import { useEffect, useState, useCallback } from "react";
import RevenueFilters from "./RevenueFilters";
import SummaryCards from "./SummaryCards";
import RevenueChart from "./RevenueChart";
import TransactionsTable from "./TransactionsTable";
import { getRevenueSummary, getRevenueTransactions } from "../../../services/hostRevenueService";

// Orchestrates revenue dashboard: filters, summary, chart, transactions.
export default function HostRevenueView() {
  const today = new Date();
  const weekAgo = new Date(today.getTime() - 6*24*3600*1000);
  const [filters, setFilters] = useState({
    from: weekAgo.toISOString().slice(0,10),
    to: today.toISOString().slice(0,10),
    groupBy: "day",
  });
  const [summaryPoints, setSummaryPoints] = useState([]);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [txData, setTxData] = useState([]);
  const [txTotal, setTxTotal] = useState(0);
  const [txPage, setTxPage] = useState(0);
  const [txSize] = useState(20);
  const [txLoading, setTxLoading] = useState(false);

  const loadSummary = useCallback(async () => {
    if (!filters.from || !filters.to) return;
    setSummaryLoading(true);
    const res = await getRevenueSummary({ ...filters });
    if (res.ok) setSummaryPoints(res.data);
    setSummaryLoading(false);
  }, [filters]);

  const loadTransactions = useCallback(async () => {
    if (!filters.from || !filters.to) return;
    setTxLoading(true);
    const res = await getRevenueTransactions({
      from: filters.from,
      to: filters.to,
      method: filters.method,
      locationId: filters.locationId,
      page: txPage,
      size: txSize,
    });
    if (res.ok) {
      setTxData(res.data?.content || []);
      setTxTotal(res.data?.totalElements || 0);
    }
    setTxLoading(false);
  }, [filters, txPage, txSize]);

  useEffect(() => { loadSummary(); }, [loadSummary]);
  useEffect(() => { loadTransactions(); }, [loadTransactions]);

  function handleFilters(next) {
    setFilters(next);
    setTxPage(0); // reset page when filters change
  }

  return (
    <div className="flex flex-col gap-6">
      <RevenueFilters value={filters} onChange={handleFilters} />
      <SummaryCards points={summaryPoints} loading={summaryLoading} />
      <RevenueChart points={summaryPoints} loading={summaryLoading} />
      <TransactionsTable
        data={txData}
        loading={txLoading}
        page={txPage}
        size={txSize}
        total={txTotal}
        onPageChange={setTxPage}
      />
    </div>
  );
}
