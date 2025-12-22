"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { menuItems } from "./sidebar";
import { cn } from "@/lib/utils";

export function MobileNav({ signOutAction }: { signOutAction: () => Promise<void> }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Hamburger Button */}
            <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-xl w-12 h-12"
                onClick={() => setIsOpen(true)}
            >
                <Menu className="w-7 h-7" />
            </Button>

            {/* Mobile Drawer Overlay */}
            <div
                className={cn(
                    "fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] transition-opacity md:hidden",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={() => setIsOpen(false)}
            />

            {/* Drawer Content */}
            <aside
                className={cn(
                    "fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl z-[101] shadow-2xl transition-transform duration-500 ease-out md:hidden flex flex-col rounded-l-[2.5rem]",
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                <div className="h-20 flex items-center justify-between px-8 border-b border-slate-100 dark:border-white/5">
                    <span className="font-black text-2xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-600">AissaPhone</span>
                    <Button variant="ghost" size="icon" className="rounded-full bg-slate-50 dark:bg-slate-800" onClick={() => setIsOpen(false)}>
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto py-8 px-6 space-y-4">
                    {menuItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-5 px-6 py-5 text-slate-700 dark:text-slate-200 hover:bg-primary hover:text-white rounded-[1.5rem] transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-primary/20 active:scale-95 group"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                <item.icon className="w-6 h-6" />
                            </div>
                            <span className="font-black text-xl tracking-tight">{item.name}</span>
                        </Link>
                    ))}
                </div>

                <div className="p-8 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/20">
                    <form action={async () => {
                        await signOutAction();
                        setIsOpen(false);
                    }}>
                        <Button variant="ghost" className="w-full justify-start text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 gap-4 font-black h-16 rounded-2xl transition-all">
                            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/50 flex items-center justify-center">
                                <LogOut className="w-5 h-5" />
                            </div>
                            <span>تسجيل الخروج</span>
                        </Button>
                    </form>
                </div>
            </aside>
        </>
    );
}
