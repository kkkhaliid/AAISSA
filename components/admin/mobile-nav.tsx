"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Settings, X, LogOut, Store, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Filtered items for Settings
const settingItems = [
    { name: "المتاجر", icon: Store, href: "/admin/stores" },
    { name: "المستخدمين", icon: Users, href: "/admin/users" },
];

export function MobileNav({ signOutAction }: { signOutAction: () => Promise<void> }) {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
    }, []);

    // Prevent scrolling when drawer is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    const handleNavigate = (href: string) => {
        setIsOpen(false);
        router.push(href);
    };

    if (!mounted) return (
        <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl w-10 h-10 border border-slate-200 dark:border-white/10"
        >
            <Settings className="w-5 h-5 text-slate-400" />
        </Button>
    );

    const drawerContent = (
        <div className="md:hidden text-right" dir="rtl">
            {/* Mobile Drawer Overlay */}
            <div
                className={cn(
                    "fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity",
                    isOpen ? "opacity-100 z-[999]" : "opacity-0 pointer-events-none z-[-1]"
                )}
                onClick={() => setIsOpen(false)}
            />

            {/* Drawer Content - Solid & Robust */}
            <aside
                className={cn(
                    "fixed inset-y-0 right-0 w-[300px] bg-white dark:bg-slate-900 shadow-2xl transition-transform duration-300 ease-in-out flex flex-col border-l border-slate-100 dark:border-white/10",
                    isOpen ? "translate-x-0 z-[1000]" : "translate-x-full z-[-1]"
                )}
                style={{ transform: !isOpen ? 'translateX(100%)' : 'translateX(0)' }}
            >
                {/* Header */}
                <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <Settings className="w-5 h-5" />
                        </div>
                        <span className="font-black text-xl text-slate-900 dark:text-white">الإعدادات</span>
                    </div>
                    <Button
                        variant="secondary"
                        size="icon"
                        className="rounded-full w-10 h-10 shadow-sm"
                        onClick={() => setIsOpen(false)}
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 overflow-y-auto py-8 px-4 space-y-2 bg-white dark:bg-slate-900">
                    <p className="px-5 mb-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">إدارة النظام</p>
                    {settingItems.map((item) => (
                        <button
                            key={item.href}
                            onClick={() => handleNavigate(item.href)}
                            className="w-full flex items-center gap-4 px-5 py-4 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 rounded-2xl transition-all border border-transparent hover:border-slate-100 dark:hover:border-white/5 active:scale-95 text-right font-bold group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors shrink-0">
                                <item.icon className="w-6 h-6" />
                            </div>
                            <span className="font-extrabold text-[1.05rem]">{item.name}</span>
                        </button>
                    ))}
                </nav>

                {/* Footer / Sign Out */}
                <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-800/30">
                    <form action={async () => {
                        await signOutAction();
                        setIsOpen(false);
                    }}>
                        <Button
                            variant="destructive"
                            className="w-full justify-center gap-3 font-bold h-14 rounded-2xl shadow-lg shadow-rose-500/20"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="text-base text-white">تسجيل الخروج</span>
                        </Button>
                    </form>
                </div>
            </aside>
        </div>
    );

    return (
        <>
            {/* Settings Button */}
            <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl w-11 h-11 border border-slate-200 dark:border-white/10 transition-all active:scale-90 group"
                onClick={() => setIsOpen(true)}
            >
                <Settings className="w-6 h-6 text-slate-400 group-hover:text-primary transition-colors" />
            </Button>

            {/* Portal for Overlay and Drawer */}
            {mounted && createPortal(drawerContent, document.body)}
        </>
    );
}
