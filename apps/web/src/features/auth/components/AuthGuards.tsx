import type { ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import { Building2 } from "lucide-react";
import { useCurrentUser } from "../hooks/useCurrentUser";

function Loading() { return <div className="flex min-h-screen items-center justify-center bg-slate-950"><div className="text-center text-white"><span className="mx-auto flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl bg-amber-400 text-slate-950"><Building2/></span><p className="mt-4 text-sm font-bold text-slate-300">Restoring your workspace…</p></div></div>; }
export function ProtectedRoute({ children }: { children?: ReactNode }) { const query=useCurrentUser(); const location=useLocation(); if(query.isPending)return <Loading/>; if(!query.data)return <Navigate to="/login" replace state={{from:location.pathname}}/>; return children ?? <Outlet/>; }
export function PublicOnlyRoute() { const query=useCurrentUser(); if(query.isPending)return <Loading/>; return query.data ? <Navigate to="/" replace/> : <Outlet/>; }
