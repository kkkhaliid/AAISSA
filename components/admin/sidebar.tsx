import Link from "next/link";
import { LayoutDashboard, Store, Users, ShoppingBag, History, FileText } from "lucide-react";

const menuItems = [
    { name: "لوحة التحكم", icon: LayoutDashboard, href: "/admin/dashboard" },
    { name: "المتاجر", icon: Store, href: "/admin/stores" },
    { name: "المنتجات", icon: ShoppingBag, href: "/admin/products" },
    { name: "المستخدمين", icon: Users, href: "/admin/users" },
    { name: "سجل المبيعات", icon: History, href: "/admin/sales" },
    { name: "التقارير", icon: FileText, href: "/admin/reports" },
];

export function AdminSidebar() {
    return (
        <aside className="w-64 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 hidden md:flex flex-col h-screen fixed right-0 top-0 pt-16 z-40">
            <div className="flex-1 px-4 space-y-2 py-4">
                {menuItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.name}</span>
                    </Link>
                ))}
            </div>
        </aside>
    );
}
