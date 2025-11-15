"use client";
import { useCallback, useEffect, useState } from "react";
import UsersFilters from "./UsersFilters";
import UsersTable from "./UsersTable";
import ConfirmSuspendModal from "./ConfirmSuspendModal";
import Pagination from "../../common/Pagination";
import { getAdminUsers, patchAdminUserStatus } from "../../../services/adminUsersService";

export default function UsersPageView(){
  const [filters, setFilters] = useState({ q:"", role:"ALL", status:"ALL", page:0, size:10 });
  const [state, setState] = useState({ items:[], totalPages:1, currentPage:0, pageSize:10 });
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState({ open: false, user: null, makeActive: false });

  const load = useCallback(async ()=>{
    setLoading(true); setError(null);
    const res = await getAdminUsers(filters);
    if (res.ok){
      const d = res.data;
      setState({
        items: d.items || [],
        totalPages: d.totalPages || 1,
        currentPage: d.currentPage || 0,
        pageSize: d.pageSize || filters.size || 10,
      });
    } else {
      setError(res.message || "โหลดไม่สำเร็จ");
    }
    setLoading(false);
  }, [filters]);

  useEffect(()=>{ load(); }, [load]);

  function openToggleModal(user, makeActive){
    setModal({ open: true, user, makeActive });
  }

  async function confirmToggle(reason){
    const { user, makeActive } = modal;
    if (!user) return;
    const newStatus = makeActive ? "ACTIVE" : "SUSPENDED";
    setBusyId(user.id);
    const res = await patchAdminUserStatus(user.id, newStatus, reason);
    if (res.ok){
      // Optimistic update of this row
      setState(s=>({
        ...s,
        items: s.items.map(it => it.id === user.id ? { ...it, active: newStatus === "ACTIVE" } : it)
      }));
    } else {
      alert(res.message || "อัปเดตสถานะไม่สำเร็จ");
    }
    setBusyId(null);
    setModal({ open:false, user:null, makeActive:false });
  }

  return (
    <div className="space-y-4">
      <UsersFilters value={filters} onChange={setFilters} />
      {error && <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-2 text-rose-700 text-sm">{error}</div>}
      <UsersTable items={state.items} loading={loading} busyId={busyId} onManage={(u)=>console.log('manage', u)} onToggleActive={openToggleModal} />
      <Pagination page={state.currentPage} totalPages={state.totalPages} onPageChange={(p)=> setFilters(f=>({...f, page:p}))} />
      <ConfirmSuspendModal
        open={modal.open}
        user={modal.user}
        makeActive={modal.makeActive}
        busy={busyId === modal.user?.id}
        onCancel={()=> setModal({ open:false, user:null, makeActive:false })}
        onConfirm={confirmToggle}
      />
    </div>
  );
}
