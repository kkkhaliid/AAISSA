import Link from "next/link";
import { LayoutDashboard, Store, Users, ShoppingBag, History, FileText } from "lucide-react";

export const menuItems = [
    { name: "لوحة التحكم", icon: LayoutDashboard, href: "/admin/dashboard" },
    { name: "المتاجر", icon: Store, href: "/admin/stores" },
    { name: "المنتجات", icon: ShoppingBag, href: "/admin/products" },
    { name: "المستخدمين", icon: Users, href: "/admin/users" },
    { name: "سجل المبيعات", icon: History, href: "/admin/sales" },
    { name: "التقارير", icon: FileText, href: "/admin/reports" },
];

export function AdminSidebar() {
    return (
        <aside className="w-64 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border-l border-slate-200/50 dark:border-white/5 hidden md:flex flex-col h-screen fixed right-0 top-0 pt-32 z-40 shadow-premium">
            <div className="flex-1 px-4 space-y-2 py-4">
                {menuItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="group flex items-center gap-3 px-4 py-3.5 text-slate-600 dark:text-slate-300 hover:bg-gradient-to-l hover:from-primary/10 hover:to-transparent rounded-2xl transition-all duration-300 active:scale-95"
                    >
                        <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors shadow-sm">
                            <item.icon className="w-5 h-5" />
                        </div>
                        <span className="font-bold tracking-tight">{item.name}</span>
                    </Link>
                ))}
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-white/5">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold shadow-lg">
                        A
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">Admin Account</p>
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">AissaPhone</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
