"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
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
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [sales, setSales] = useState(initialSales);

    // Supabase Realtime subscription
    useEffect(() => {
        const supabase = createClient();

        const channel = supabase
            .channel('sales-changes')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'sales' },
                () => {
                    router.refresh();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [router]);

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

    // Grouping Logic
    const groupedSales = filteredSales.reduce((acc, sale) => {
        const date = new Date(sale.created_at);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        let key = "older";
        if (date.toDateString() === today.toDateString()) key = "today";
        else if (date.toDateString() === yesterday.toDateString()) key = "yesterday";

        if (!acc[key]) acc[key] = [];
        acc[key].push(sale);
        return acc;
    }, {} as Record<string, Sale[]>);

    const groups = [
        { key: "today", label: "اليوم" },
        { key: "yesterday", label: "أمس" },
        { key: "older", label: "الأرشيف" },
    ];

    return (
        <div className="space-y-8 max-w-5xl mx-auto px-4 md:px-0 pb-24 md:pb-0" dir="rtl">
            {/* Header */}
            <div className="flex flex-col items-center md:items-start justify-between gap-6 px-4 md:px-0 text-center md:text-right">
                <div className="flex flex-col items-center md:items-start">
                    <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">سجل المبيعات</h1>
                    <p className="text-slate-500 font-medium mt-2 text-sm md:text-lg">تتبع الأداء المالي والعمليات اليومية</p>
                </div>

                <div className="relative group w-full md:w-96 z-10">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="بحث سريع..."
                        className="h-12 md:h-14 pr-12 pl-4 w-full rounded-2xl border-0 bg-white dark:bg-slate-800/50 glass dark:glass-dark shadow-premium focus-visible:ring-primary/20 text-right text-base font-medium"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Smart Metrics - Visual & Compact */}
            <div className="grid grid-cols-2 gap-4 md:gap-6">
                <div className="bg-slate-900 dark:bg-white rounded-[2rem] p-6 text-white dark:text-slate-900 shadow-xl shadow-slate-900/10 relative overflow-hidden">
                    <div className="relative z-10 flex flex-col items-center md:items-start text-center md:text-right">
                        <span className="text-[10px] md:text-xs font-black uppercase tracking-widest opacity-60 mb-2">الإيرادات</span>
                        <div className="text-2xl md:text-4xl font-black tracking-tighter">
                            {totalRevenue.toLocaleString()} <span className="text-sm opacity-60">DH</span>
                        </div>
                    </div>
                    <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/10 dark:bg-black/5 rounded-full blur-2xl" />
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden">
                    <div className="relative z-10 flex flex-col items-center md:items-start text-center md:text-right">
                        <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2">الأرباح</span>
                        <div className="text-2xl md:text-4xl font-black tracking-tighter text-emerald-600 dark:text-emerald-400">
                            {totalProfit.toLocaleString()} <span className="text-sm opacity-60">DH</span>
                        </div>
                        <div className="mt-2 text-[10px] font-bold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 px-2 py-0.5 rounded-full inline-block">
                            +{((totalProfit / totalRevenue) * 100 || 0).toFixed(1)}% هامش
                        </div>
                    </div>
                </div>
            </div>

            {/* Activity Feed Timeline */}
            <div className="space-y-8 relative">
                {/* Timeline Line (Desktop only) */}
                <div className="absolute right-8 top-4 bottom-0 w-px bg-slate-200 dark:bg-slate-800 hidden md:block" />

                {filteredSales.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                            <Search className="w-8 h-8 opacity-50" />
                        </div>
                        <p className="font-bold">لا توجد عمليات</p>
                    </div>
                ) : (
                    groups.map((group) => {
                        const groupItems = groupedSales[group.key] || [];
                        if (groupItems.length === 0) return null;

                        return (
                            <div key={group.key} className="space-y-4">
                                <div className="sticky top-0 z-20 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-sm py-2 px-4 md:px-0 flex items-center">
                                    <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700 hidden md:block absolute right-[30px]" />
                                    <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest bg-slate-100 dark:bg-slate-800/50 px-3 py-1 rounded-lg inline-block">
                                        {group.label} <span className="mr-2 opacity-50 text-[10px]">({groupItems.length})</span>
                                    </h3>
                                </div>

                                <div className="space-y-3">
                                    {groupItems.map((sale) => (
                                        <div
                                            key={sale.id}
                                            className={cn(
                                                "relative flex items-center gap-4 p-4 md:mr-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-lg transition-all duration-300 group overflow-hidden",
                                                sale.status === 'undone' ? "opacity-60 grayscale" : ""
                                            )}
                                        >
                                            {/* Status Indicator Bar */}
                                            <div className={cn(
                                                "absolute right-0 top-0 bottom-0 w-1.5",
                                                sale.status === 'active' ? "bg-emerald-500" : "bg-rose-500"
                                            )} />

                                            {/* Avatar/Icon */}
                                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 font-black text-lg shadow-inner">
                                                {sale.profiles?.full_name?.charAt(0).toUpperCase() || <User className="w-6 h-6" />}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <div className="font-bold text-slate-900 dark:text-white text-base">
                                                            {sale.stores?.name || "Store"}
                                                            <span className="mx-2 text-slate-300">•</span>
                                                            <span className="text-slate-500 font-medium text-sm">{sale.profiles?.full_name}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-xs text-slate-400 font-bold font-mono">
                                                                {new Date(sale.created_at).toLocaleTimeString("ar-MA", { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                            {sale.status === 'undone' && (
                                                                <Badge variant="destructive" className="text-[9px] h-4">ملغاة</Badge>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Amount */}
                                                    <div className="text-left">
                                                        <div className="font-black text-lg text-slate-900 dark:text-white tracking-tight">
                                                            {sale.total_price} <span className="text-xs text-slate-400">DH</span>
                                                        </div>
                                                        <div className="text-xs font-bold text-emerald-500 mt-0.5">
                                                            +{sale.profit} ربح
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="pr-2">
                                                {sale.status === 'active' && (
                                                    <ActionButton
                                                        action={undoSale}
                                                        id={sale.id}
                                                        label="undo"
                                                        className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors flex items-center justify-center"
                                                    >
                                                        <RotateCcw className="w-4 h-4" />
                                                    </ActionButton>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
