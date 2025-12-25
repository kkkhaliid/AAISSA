"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RotateCcw, ShoppingCart, Calendar, User, Store, DollarSign, TrendingUp, Search, Filter, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ActionButton } from "@/components/admin/action-button";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { undoSale } from "@/app/admin/sales/actions";

interface Sale {
    id: string;
    created_at: string;
    total_price: number;
    profit: number;
    status: string;
    stores: { name: string } | null;
    profiles: { full_name: string } | null;
}

export function SalesManager({ initialSales }: { initialSales: Sale[] }) {
    const [search, setSearch] = useState("");
    const [sales, setSales] = useState(initialSales);

    const filteredSales = sales.filter(sale => {
        const storeName = sale.stores?.name || "";
        const workerName = sale.profiles?.full_name || "";
        return storeName.toLowerCase().includes(search.toLowerCase()) ||
            workerName.toLowerCase().includes(search.toLowerCase());
    });

    const totalRevenue = filteredSales
        .filter(s => s.status === 'active')
        .reduce((sum, s) => sum + s.total_price, 0);

    const totalProfit = filteredSales
        .filter(s => s.status === 'active')
        .reduce((sum, s) => sum + s.profit, 0);

    return (
        <div className="space-y-6 md:space-y-10 max-w-7xl mx-auto px-4 md:px-0 pb-20 md:pb-0" dir="rtl">
            {/* Header */}
            <div className="flex flex-col items-center md:items-start text-center md:text-right gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">سجل العمليات</h1>
                    <p className="text-slate-500 font-medium mt-2 text-sm md:text-base">مراجعة وإدارة جميع عمليات البيع المسجلة</p>
                </div>
                <div className="flex w-full md:w-auto justify-center">
                    <div className="relative group w-full md:w-80">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="البحث بالمتجر أو الموظف..."
                            className="h-12 md:h-14 pr-12 pl-4 w-full rounded-2xl border-0 bg-white dark:bg-slate-800/50 glass dark:glass-dark shadow-premium focus-visible:ring-primary/20 text-right"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Premium KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mt-6 md:mt-10">
                <div className="glass dark:glass-dark p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-premium border-0 relative overflow-hidden group">
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl transition-opacity group-hover:opacity-20" />
                    <div className="flex items-center gap-4 md:gap-6">
                        <div className="w-14 h-14 md:w-20 md:h-20 rounded-xl md:rounded-3xl bg-indigo-50 dark:bg-indigo-500/10 text-primary flex items-center justify-center shadow-sm">
                            <DollarSign className="w-7 h-7 md:w-10 md:h-10" />
                        </div>
                        <div>
                            <p className="text-[9px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-1">إجمالي الإيرادات</p>
                            <h3 className="text-xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                                {totalRevenue.toFixed(0)} <span className="text-xs md:text-lg font-bold">DH</span>
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="glass dark:glass-dark p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-premium border-0 relative overflow-hidden group">
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl transition-opacity group-hover:opacity-20" />
                    <div className="flex items-center gap-4 md:gap-6">
                        <div className="w-14 h-14 md:w-20 md:h-20 rounded-xl md:rounded-3xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 flex items-center justify-center shadow-sm">
                            <TrendingUp className="w-7 h-7 md:w-10 md:h-10" />
                        </div>
                        <div>
                            <p className="text-[9px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-1">صافي الأرباح</p>
                            <h3 className="text-xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter text-emerald-500">
                                {totalProfit.toFixed(0)} <span className="text-xs md:text-lg font-bold text-slate-400">DH</span>
                            </h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sales List: Cards on Mobile, Table on Desktop */}
            <div className="space-y-4">
                {/* Desktop Header */}
                <div className="hidden md:grid grid-cols-7 px-10 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                    <div className="pr-4">التاريخ والوقت</div>
                    <div>المتجر</div>
                    <div>الموظف</div>
                    <div>المبلغ الإجمالي</div>
                    <div>الربح</div>
                    <div>الحالة</div>
                    <div className="text-left">الإجراءات</div>
                </div>

                {filteredSales.length === 0 ? (
                    <div className="glass dark:glass-dark rounded-[2.5rem] p-20 md:p-32 text-center border-0">
                        <div className="flex flex-col items-center justify-center text-slate-300">
                            <div className="w-20 h-20 md:w-24 md:h-24 bg-slate-50 dark:bg-slate-800 rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-center mb-6">
                                <X className="w-10 h-10 md:w-12 md:h-12" />
                            </div>
                            <p className="font-black text-xl md:text-2xl text-slate-900 dark:text-white">لا توجد نتائج مطابقة</p>
                        </div>
                    </div>
                ) : (
                    filteredSales.map((sale) => (
                        <div
                            key={sale.id}
                            className={cn(
                                "flex flex-col md:grid md:grid-cols-7 gap-4 md:gap-4 items-start md:items-center bg-white dark:bg-slate-900 p-6 md:p-4 md:px-10 rounded-[2rem] md:rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-300 ring-1 ring-black/5 dark:ring-white/5 group relative overflow-hidden",
                                sale.status === 'undone' && "bg-rose-50/50 dark:bg-rose-950/20 opacity-80"
                            )}
                        >
                            {/* Date & Time (Mobile Header) */}
                            <div className="flex w-full justify-between items-center md:items-start md:flex-col group-hover:bg-slate-50/10 rounded-xl transition-colors">
                                <div className="flex flex-col">
                                    <span className="font-black text-slate-900 dark:text-white text-lg">
                                        {new Date(sale.created_at).toLocaleTimeString("ar-MA", { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                        {new Date(sale.created_at).toLocaleDateString("ar-MA", { day: 'numeric', month: 'short' })}
                                    </span>
                                </div>

                                {/* Status Badge (Mobile inline) */}
                                <div className={cn(
                                    "md:hidden inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                                    sale.status === 'active'
                                        ? "bg-emerald-500 text-white"
                                        : "bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400"
                                )}>
                                    {sale.status === 'active' ? 'مكتملة' : 'ملغاة'}
                                </div>
                            </div>

                            {/* Store */}
                            <div className="flex items-center gap-2 md:contents text-slate-900 dark:text-white font-black text-sm md:text-base">
                                <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                    <Store className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-400" />
                                </div>
                                <span className="opacity-80 md:opacity-100">{sale.stores?.name || "Global"}</span>
                            </div>

                            {/* Worker */}
                            <div className="flex items-center gap-2.5 md:contents">
                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-primary font-black text-xs md:text-sm shrink-0">
                                    {sale.profiles?.full_name?.charAt(0) || "?"}
                                </div>
                                <span className="font-bold text-slate-600 dark:text-slate-400 text-sm md:text-base">
                                    {sale.profiles?.full_name || "غير معروف"}
                                </span>
                            </div>

                            {/* Amount & Profit (Stacked for Mobile) */}
                            <div className="flex w-full items-center justify-between md:contents pt-4 md:pt-0 border-t md:border-t-0 border-slate-50 dark:border-white/5">
                                <div className="flex flex-col">
                                    <span className="font-black text-slate-900 dark:text-white text-xl md:text-xl tracking-tighter">
                                        {sale.total_price.toFixed(0)} <span className="text-[10px] font-bold text-slate-400">DH</span>
                                    </span>
                                    <span className="md:hidden text-[9px] font-black text-slate-400 uppercase tracking-widest">المبلغ الإجمالي</span>
                                </div>

                                <div className="flex flex-col text-left md:text-right">
                                    <span className="text-emerald-500 font-black text-base md:text-lg tracking-tighter">
                                        +{sale.profit.toFixed(0)} <span className="text-[10px] font-bold text-slate-400">DH</span>
                                    </span>
                                    <span className="md:hidden text-[9px] font-black text-slate-400 uppercase tracking-widest">الربح</span>
                                </div>
                            </div>

                            {/* Status (Desktop only) */}
                            <div className="hidden md:flex">
                                <div className={cn(
                                    "inline-flex px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                                    sale.status === 'active'
                                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200 dark:shadow-none"
                                        : "bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400"
                                )}>
                                    {sale.status === 'active' ? 'مكتملة' : 'ملغاة'}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex w-full md:w-auto justify-end pt-2 md:pt-0">
                                {sale.status === 'active' && (
                                    <ActionButton
                                        action={undoSale}
                                        id={sale.id}
                                        label="Revert"
                                        className="h-10 md:h-12 w-full md:w-12 rounded-xl md:rounded-2xl transition-all text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-100 dark:border-rose-950/50 md:border-0 md:opacity-0 group-hover:opacity-100 flex items-center justify-center"
                                    >
                                        <RotateCcw className="w-5 h-5 md:w-6 md:h-6 md:ml-0 ml-2" />
                                        <span className="md:hidden font-black text-xs uppercase tracking-widest">إلغاء العملية</span>
                                    </ActionButton>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>

    );
}
