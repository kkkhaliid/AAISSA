"use client";

import { DollarSign, ShoppingBag, TrendingUp, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const DynamicIcons = {
    DollarSign,
    ShoppingBag,
    TrendingUp,
    AlertTriangle,
    Plus: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M5 12h14" /><path d="M12 5v14" /></svg>, // Manually add if missing from imports or just import all
    Users: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
    ArrowRight: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
};

// Actually, let's just import them properly
import { Plus, Users, ArrowRight } from "lucide-react";

const IconList = {
    DollarSign,
    ShoppingBag,
    TrendingUp,
    AlertTriangle,
    Plus,
    Users,
    ArrowRight
};

export function KPICard({ title, value, icon, trend, color, isCurrency }: any) {
    const Icon = IconList[icon as keyof typeof IconList] || TrendingUp;
    const variants = {
        indigo: {
            bg: "bg-indigo-500/10 dark:bg-indigo-500/10",
            iconBg: "bg-indigo-500 text-white shadow-indigo-500/20",
            indicator: "bg-indigo-500",
            glow: "bg-indigo-500/5"
        },
        emerald: {
            bg: "bg-emerald-500/10 dark:bg-emerald-500/10",
            iconBg: "bg-emerald-500 text-white shadow-emerald-500/20",
            indicator: "bg-emerald-500",
            glow: "bg-emerald-500/5"
        },
        rose: {
            bg: "bg-rose-500/10 dark:bg-rose-500/10",
            iconBg: "bg-rose-500 text-white shadow-rose-500/20",
            indicator: "bg-rose-500",
            glow: "bg-rose-500/5"
        },
        amber: {
            bg: "bg-amber-500/10 dark:bg-amber-500/10",
            iconBg: "bg-amber-500 text-white shadow-amber-500/20",
            indicator: "bg-amber-500",
            glow: "bg-amber-500/5"
        },
        slate: {
            bg: "bg-slate-500/10 dark:bg-slate-500/10",
            iconBg: "bg-slate-500 text-white shadow-slate-500/20",
            indicator: "bg-slate-500",
            glow: "bg-slate-500/5"
        },
    };

    const config = variants[color as keyof typeof variants] || variants.indigo;

    return (
        <div className="group relative glass dark:glass-dark p-8 rounded-[2.5rem] shadow-premium overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl border-0 ring-1 ring-white/20 dark:ring-white/5 active:scale-[0.98]">
            {/* Background Glow */}
            <div className={cn("absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl group-hover:opacity-40 transition-opacity duration-700", config.glow)} />

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                    <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-500 group-hover:scale-110", config.iconBg)}>
                        <Icon className="w-8 h-8" />
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">{title}</p>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums leading-none">
                            {isCurrency ? value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : value}
                            {isCurrency && <span className="text-xs font-bold text-slate-400 ml-1.5 opacity-60">DH</span>}
                        </h3>
                    </div>
                </div>

                <div className="flex items-center gap-2.5 px-0.5">
                    <div className={cn("w-2 h-2 rounded-full animate-pulse shadow-[0_0_8px] shadow-current transition-all", config.indicator)} />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{trend}</span>
                </div>
            </div>

            {/* Subtle Progress Track at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5 overflow-hidden">
                <div className={cn("h-full w-0 group-hover:w-full transition-all duration-[1.5s] ease-out", config.indicator)} />
            </div>
        </div>
    );
}

export function KPICardSkeleton() {
    return (
        <div className="glass dark:glass-dark p-8 rounded-[2.5rem] shadow-premium h-[164px] animate-pulse">
            <div className="flex items-center justify-between mb-8">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800" />
                <div className="flex flex-col items-end gap-2">
                    <div className="w-20 h-2 bg-slate-100 dark:bg-slate-800 rounded" />
                    <div className="w-32 h-6 bg-slate-100 dark:bg-slate-800 rounded" />
                </div>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-slate-100 dark:bg-slate-800" />
                <div className="w-24 h-2 bg-slate-100 dark:bg-slate-800 rounded" />
            </div>
        </div>
    );
}

export function QuickAction({ href, title, subtitle, icon, color }: any) {
    const Icon = IconList[icon as keyof typeof IconList] || ArrowRight;
    const colorClasses = {
        indigo: "bg-primary text-white shadow-primary/30",
        emerald: "bg-emerald-500 text-white shadow-emerald-500/30",
        slate: "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-slate-900/20 dark:shadow-white/20",
    };

    return (
        <Link
            href={href}
            className="group relative flex flex-col items-center text-center gap-6 p-10 glass dark:glass-dark rounded-[3rem] shadow-premium hover:shadow-3xl hover:-translate-y-2 transition-all duration-500 border-0 ring-1 ring-white/20 dark:ring-white/5 overflow-hidden"
        >
            <div className="absolute inset-x-0 top-0 h-full w-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 z-10" />
            <div className={cn("w-20 h-20 rounded-[1.8rem] flex items-center justify-center transition-all duration-500 shadow-2xl group-hover:scale-110 group-hover:-rotate-3 relative z-20", colorClasses[color as keyof typeof colorClasses])}>
                <Icon className="w-10 h-10" />
            </div>
            <div className="relative z-20">
                <h4 className="font-black text-xl text-slate-900 dark:text-white group-hover:text-primary transition-colors tracking-tight">{title}</h4>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-2 opacity-80">{subtitle}</p>
            </div>
        </Link>
    );
}
