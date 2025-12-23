"use client";

import { ShoppingBag, TrendingUp, AlertTriangle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function PerformanceChart({ chartData, maxWeeklyValue }: any) {
    return (
        <div className="glass dark:glass-dark p-8 rounded-[3rem] shadow-premium relative overflow-hidden group border border-white/20 dark:border-white/5">
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-[100px] group-hover:bg-primary/20 transition-all duration-700" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-violet-500/10 rounded-full blur-[100px] group-hover:bg-violet-500/20 transition-all duration-700" />

            <div className="relative">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">الأداء الأسبوعي</h3>
                        <div className="flex items-center gap-2 mt-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">إحصائيات المبيعات الحية لآخر 7 أيام</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-100/50 dark:bg-slate-800/50 p-1.5 rounded-2xl backdrop-blur-sm border border-slate-200/50 dark:border-white/5">
                        <button className="px-4 py-2 rounded-xl text-xs font-black bg-white dark:bg-slate-700 shadow-sm text-primary">7 أيام</button>
                        <button className="px-4 py-2 rounded-xl text-xs font-black text-slate-400 hover:text-slate-600 transition-colors">30 يوم</button>
                    </div>
                </div>

                <div className="relative h-72 w-full flex items-end">
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-50">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="w-full border-t border-dashed border-slate-200 dark:border-white/10" />
                        ))}
                        <div className="w-full border-t border-slate-200 dark:border-white/10" />
                    </div>

                    <div className="relative z-10 w-full h-full flex items-end justify-between gap-3 md:gap-5 px-2">
                        {chartData.map((data: any, i: number) => {
                            const percentage = (data.value / maxWeeklyValue) * 100;
                            return (
                                <div key={i} className="flex-1 flex flex-col justify-end group/bar items-center h-full relative">
                                    <div className="absolute bottom-10 w-full max-w-[32px] bg-primary/20 blur-xl opacity-0 group-hover/bar:opacity-100 transition-opacity duration-500" style={{ height: `${Math.max(percentage, 10)}%` }} />
                                    <div className="w-full max-w-[32px] bg-slate-100/50 dark:bg-slate-800/50 rounded-full group-hover/bar:bg-slate-200/50 dark:group-hover/bar:bg-slate-700/50 transition-all duration-500 relative flex flex-col justify-end min-h-[12px] shadow-inner" style={{ height: `${Math.max(percentage, 10)}%` }}>
                                        <div className="w-full bg-gradient-to-t from-primary via-indigo-500 to-indigo-400 rounded-full shadow-[0_-8px_24px_rgba(79,70,229,0.3)] transition-all duration-1000 ease-out h-full" />
                                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 -translate-x-full group-hover/bar:translate-x-full transition-transform duration-1000" />
                                    </div>
                                    <div className="absolute bottom-full mb-6 left-1/2 -translate-x-1/2 opacity-0 scale-50 group-hover/bar:opacity-100 group-hover/bar:scale-100 transition-all duration-300 z-30 pointer-events-none">
                                        <div className="bg-slate-900 dark:bg-white p-3 px-5 rounded-2xl shadow-2xl ring-1 ring-white/10 text-center min-w-[120px]">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{data.label}</p>
                                            <p className="text-lg font-black text-white dark:text-slate-900 tabular-nums">{data.value.toLocaleString()} <span className="text-[10px] opacity-70">DH</span></p>
                                            <div className="absolute top-[95%] left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900 dark:border-t-white" />
                                        </div>
                                    </div>
                                    <div className="text-[10px] font-black text-slate-400 mt-6 uppercase tracking-[0.2em]">{data.label}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

export function PerformanceChartSkeleton() {
    return (
        <div className="glass dark:glass-dark p-8 rounded-[3rem] shadow-premium h-[480px] animate-pulse">
            <div className="flex items-center justify-between mb-12">
                <div className="space-y-3">
                    <div className="w-48 h-8 bg-slate-100 dark:bg-slate-800 rounded-xl" />
                    <div className="w-64 h-3 bg-slate-100 dark:bg-slate-800 rounded shadow-sm" />
                </div>
                <div className="w-32 h-10 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
            </div>
            <div className="flex items-end justify-between h-64 gap-4 px-2">
                {[...Array(7)].map((_, i) => (
                    <div key={i} className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full" style={{ height: `${Math.random() * 60 + 20}%` }} />
                ))}
            </div>
        </div>
    );
}

export function ActivitySidebar({ recentSales }: any) {
    return (
        <div className="group relative glass dark:glass-dark p-10 rounded-[3rem] shadow-premium h-full flex flex-col overflow-hidden border-0 ring-1 ring-white/20 dark:ring-white/5 transition-all duration-500 hover:shadow-2xl">
            <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">نشاط اليوم</h3>
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                        <TrendingUp className="w-4 h-4" />
                    </div>
                </div>

                <div className="space-y-6 flex-1">
                    {recentSales?.map((sale: any) => (
                        <div key={sale.id} className="flex gap-5 items-center group/item cursor-pointer">
                            <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800/80 flex items-center justify-center shrink-0 group-hover/item:bg-primary group-hover/item:text-white transition-all duration-300 shadow-sm ring-1 ring-black/5">
                                <ShoppingBag className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-black text-slate-900 dark:text-white truncate group-hover/item:text-primary transition-colors">{sale.product_name || "منتج غير معروف"}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest whitespace-nowrap overflow-hidden text-ellipsis">
                                        {new Date(sale.created_at).toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit' })} • <span className="text-slate-400">{sale.stores?.name}</span>
                                    </p>
                                </div>
                            </div>
                            <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 shrink-0 tabular-nums">+{sale.total_price.toLocaleString()} <span className="text-[10px] opacity-70">DH</span></div>
                        </div>
                    ))}
                </div>

                <Button variant="ghost" className="w-full mt-10 rounded-2xl h-14 font-black text-primary hover:bg-primary/5 border border-primary/10 group-hover:border-primary/20 transition-all hover:translate-x-[-4px]">
                    <span className="flex-1 text-right">مشاهدة جميع العمليات</span>
                    <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
            </div>
        </div>
    );
}

export function ActivitySidebarSkeleton() {
    return (
        <div className="glass dark:glass-dark p-10 rounded-[3rem] shadow-premium h-full animate-pulse">
            <div className="flex items-center justify-between mb-8">
                <div className="w-32 h-6 bg-slate-100 dark:bg-slate-800 rounded" />
                <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-xl" />
            </div>
            <div className="space-y-8">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex gap-5 items-center">
                        <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
                        <div className="flex-1 space-y-2">
                            <div className="w-24 h-3 bg-slate-100 dark:bg-slate-800 rounded" />
                            <div className="w-16 h-2 bg-slate-100 dark:bg-slate-800 rounded" />
                        </div>
                        <div className="w-12 h-4 bg-slate-100 dark:bg-slate-800 rounded" />
                    </div>
                ))}
            </div>
        </div>
    );
}
