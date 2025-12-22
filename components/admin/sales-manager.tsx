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
        <div className="space-y-10 max-w-7xl mx-auto" dir="rtl">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">سجل العمليات</h1>
                    <p className="text-slate-500 font-medium mt-2">مراجعة وإدارة جميع عمليات البيع المسجلة</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative group">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="البحث بالمتجر أو الموظف..."
                            className="h-14 pr-12 pl-4 w-full md:w-80 rounded-2xl border-0 bg-white dark:bg-slate-800/50 glass dark:glass-dark shadow-premium focus-visible:ring-primary/20 text-right"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Premium KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
                <div className="glass dark:glass-dark p-8 rounded-[2.5rem] shadow-premium border-0 relative overflow-hidden group">
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl transition-opacity group-hover:opacity-20" />
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-3xl bg-indigo-50 dark:bg-indigo-500/10 text-primary flex items-center justify-center shadow-sm">
                            <DollarSign className="w-10 h-10" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">إجمالي الإيرادات</p>
                            <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                                {totalRevenue.toFixed(0)} <span className="text-lg font-bold">DH</span>
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="glass dark:glass-dark p-8 rounded-[2.5rem] shadow-premium border-0 relative overflow-hidden group">
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl transition-opacity group-hover:opacity-20" />
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-3xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 flex items-center justify-center shadow-sm">
                            <TrendingUp className="w-10 h-10" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">صافي الأرباح</p>
                            <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter text-emerald-500">
                                {totalProfit.toFixed(0)} <span className="text-lg font-bold text-slate-400">DH</span>
                            </h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sales Table Container */}
            <div className="glass dark:glass-dark rounded-[2.5rem] shadow-premium overflow-hidden border-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-slate-100 dark:border-white/5 hover:bg-transparent h-20">
                                <TableHead className="text-right font-black text-slate-400 uppercase tracking-widest text-[10px] pr-8">التاريخ والوقت</TableHead>
                                <TableHead className="text-right font-black text-slate-400 uppercase tracking-widest text-[10px]">المتجر</TableHead>
                                <TableHead className="text-right font-black text-slate-400 uppercase tracking-widest text-[10px]">الموظف</TableHead>
                                <TableHead className="text-right font-black text-slate-400 uppercase tracking-widest text-[10px]">المبلغ الإجمالي</TableHead>
                                <TableHead className="text-right font-black text-slate-400 uppercase tracking-widest text-[10px]">الربح</TableHead>
                                <TableHead className="text-right font-black text-slate-400 uppercase tracking-widest text-[10px]">الحالة</TableHead>
                                <TableHead className="w-[100px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredSales.map((sale) => (
                                <TableRow
                                    key={sale.id}
                                    className={cn(
                                        "group transition-colors border-slate-100 dark:border-white/5 h-24",
                                        sale.status === 'undone' ? 'bg-rose-50/30 dark:bg-rose-950/20 opacity-70 italic' : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
                                    )}
                                >
                                    <TableCell className="pr-8">
                                        <div className="flex flex-col">
                                            <span className="font-black text-slate-900 dark:text-white text-lg">
                                                {new Date(sale.created_at).toLocaleTimeString("ar-MA", { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                                                {new Date(sale.created_at).toLocaleDateString("ar-MA", { day: 'numeric', month: 'short' })}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-slate-900 dark:text-white font-black text-base">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                <Store className="w-4 h-4 text-slate-400" />
                                            </div>
                                            {sale.stores?.name || "Global"}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-primary font-black text-sm">
                                                {sale.profiles?.full_name?.charAt(0) || "?"}
                                            </div>
                                            <span className="font-bold text-slate-700 dark:text-slate-300">
                                                {sale.profiles?.full_name || "غير معروف"}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-black text-slate-900 dark:text-white text-xl tracking-tighter">
                                        {sale.total_price.toFixed(2)} <span className="text-xs font-bold text-slate-400">DH</span>
                                    </TableCell>
                                    <TableCell className="text-emerald-500 font-black text-lg tracking-tighter">
                                        +{sale.profit.toFixed(2)} <span className="text-xs font-bold text-slate-400">DH</span>
                                    </TableCell>
                                    <TableCell>
                                        <div className={cn(
                                            "inline-flex px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                                            sale.status === 'active'
                                                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200 dark:shadow-none"
                                                : "bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400"
                                        )}>
                                            {sale.status === 'active' ? 'مكتملة' : 'ملغاة'}
                                        </div>
                                    </TableCell>
                                    <TableCell className="pl-8">
                                        {sale.status === 'active' && (
                                            <ActionButton
                                                action={undoSale}
                                                id={sale.id}
                                                label="Revert"
                                                className="opacity-0 group-hover:opacity-100 transition-opacity text-rose-600 hover:text-white hover:bg-rose-600 rounded-2xl w-12 h-12 flex items-center justify-center p-0"
                                            >
                                                <RotateCcw className="w-6 h-6" />
                                            </ActionButton>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}

                            {filteredSales.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-300">
                                            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] flex items-center justify-center mb-6">
                                                <X className="w-12 h-12" />
                                            </div>
                                            <p className="font-black text-2xl text-slate-900 dark:text-white">لا توجد نتائج مطابقة</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
