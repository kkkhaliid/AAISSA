import Link from "next/link";
import { OverdueBadge } from "./overdue-badge";
import { menuItems } from "@/lib/nav-items";


export function AdminSidebar() {
    return (
        <aside className="hidden md:flex flex-col w-72 fixed right-4 top-28 bottom-4 z-40 rounded-[2.5rem] border border-white/20 dark:border-white/5 shadow-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl overflow-hidden transition-all duration-500 group/sidebar hover:bg-white/70 dark:hover:bg-slate-900/70">
            {/* Ambient Background Gradient inside sidebar */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-white/20 dark:from-white/5 dark:to-white/5 pointer-events-none" />

            <div className="flex-1 px-4 space-y-3 py-6 overflow-y-auto no-scrollbar relative z-10">
                <div className="px-4 pb-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-2 px-2">القائمة الرئيسية</p>
                </div>
                {menuItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="group flex items-center gap-4 px-5 py-4 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white relative overflow-hidden rounded-[2rem] transition-all duration-300"
                    >
                        {/* Hover Background */}
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* Active Indicator Strip (Optional, for now just hover) */}
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 h-1/2 w-1 bg-primary rounded-l-full opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-1 group-hover:translate-x-0" />

                        <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 shadow-sm ring-1 ring-slate-100 dark:ring-white/5 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 z-10">
                            <item.icon className="w-5 h-5 group-hover:text-primary transition-colors" />
                        </div>
                        <span className="font-bold tracking-tight text-base z-10">{item.name}</span>
                        {item.name === "الديون" && (
                            <div className="mr-auto z-10">
                                <OverdueBadge />
                            </div>
                        )}
                    </Link>
                ))}
            </div>

            <div className="p-4 relative z-10">
                <div className="group relative flex items-center gap-4 p-4 rounded-[2.5rem] bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xl shadow-indigo-500/20 overflow-hidden cursor-pointer hover:shadow-2xl hover:shadow-indigo-500/40 transition-all duration-300">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                    <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />

                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white font-black shadow-inner shrink-0 relative z-10">
                        A
                    </div>
                    <div className="min-w-0 flex-1 relative z-10">
                        <p className="text-sm font-black text-white truncate">Admin Account</p>
                        <p className="text-[9px] text-indigo-100 uppercase font-bold tracking-widest mt-0.5">مدير النظام</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
