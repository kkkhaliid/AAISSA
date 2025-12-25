"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingBag, CreditCard, History, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const bottomNavItems = [
    { name: "الرئيسية", icon: LayoutDashboard, href: "/admin/dashboard" },
    { name: "المنتجات", icon: ShoppingBag, href: "/admin/products" },
    { name: "الديون", icon: CreditCard, href: "/admin/debts" },
    { name: "السجل", icon: History, href: "/admin/sales" },
    { name: "التقارير", icon: FileText, href: "/admin/reports" },
];


export function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200/50 dark:border-white/5 z-[60] px-4 pb-safe">
            <div className="flex items-center justify-around h-full max-w-lg mx-auto">
                {bottomNavItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1.5 transition-all duration-300 relative group",
                                isActive ? "text-primary" : "text-slate-400 dark:text-slate-500"
                            )}
                        >
                            <div className={cn(
                                "w-12 h-10 rounded-2xl flex items-center justify-center transition-all duration-300",
                                isActive ? "bg-primary/10" : "group-active:scale-90"
                            )}>
                                <item.icon className={cn(
                                    "w-6 h-6 transition-transform duration-300",
                                    isActive && "scale-110"
                                )} />
                            </div>
                            <span className={cn(
                                "text-[10px] font-bold tracking-tight transition-all duration-300",
                                isActive ? "opacity-100 transform translate-y-0" : "opacity-70"
                            )}>
                                {item.name}
                            </span>
                            {isActive && (
                                <div className="absolute -top-1 w-1 h-1 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.6)]" />
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
