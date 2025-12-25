import { LayoutDashboard, Store, Users, ShoppingBag, History, FileText, CreditCard } from "lucide-react";

export const menuItems = [
    { name: "لوحة التحكم", icon: LayoutDashboard, href: "/admin/dashboard" },
    { name: "المتاجر", icon: Store, href: "/admin/stores" },
    { name: "المنتجات", icon: ShoppingBag, href: "/admin/products" },
    { name: "المستخدمين", icon: Users, href: "/admin/users" },
    { name: "الديون", icon: CreditCard, href: "/admin/debts" },
    { name: "سجل المبيعات", icon: History, href: "/admin/sales" },
    { name: "الالتقارير", icon: FileText, href: "/admin/reports" },
];
