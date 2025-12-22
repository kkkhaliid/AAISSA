import { createClient } from "@/utils/supabase/server";
import { DollarSign, ShoppingBag, TrendingUp, AlertTriangle, Plus, Users, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default async function AdminDashboard() {
    const supabase = await createClient();

    // -- DATA FETCHING --
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 1. Sales Today
    const { data: salesToday } = await supabase
        .from("sales")
        .select("total_price, profit")
        .eq("status", "active")
        .gte("created_at", today.toISOString())
        .lt("created_at", tomorrow.toISOString());

    const totalSalesToday = salesToday?.reduce((sum, s) => sum + (s.total_price || 0), 0) || 0;
    const totalProfitToday = salesToday?.reduce((sum, s) => sum + (s.profit || 0), 0) || 0;

    // 2. Low Stock Alerts
    // We want meaningful alerts. Let's say < 5 stock.
    const { count: lowStockCount } = await supabase
        .from("products")
        .select("*", { count: 'exact', head: true })
        .lt("stock", 5);

    // 3. Total Products
    const { count: totalProducts } = await supabase
        .from("products")
        .select("*", { count: 'exact', head: true });

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
                <p className="text-muted-foreground mt-1">Overview of your store performance</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    title="Sales Today"
                    value={`${totalSalesToday.toFixed(2)} DH`}
                    icon={DollarSign}
                    trend="Daily Total"
                />
                <KPICard
                    title="Net Profit"
                    value={`${totalProfitToday.toFixed(2)} DH`}
                    icon={TrendingUp}
                    trend="Today's Profit"
                    variant="success"
                />
                <KPICard
                    title="Low Stock"
                    value={lowStockCount?.toString() || "0"}
                    icon={AlertTriangle}
                    trend="Items need restock"
                    variant={lowStockCount && lowStockCount > 0 ? "warning" : "neutral"}
                />
                <KPICard
                    title="Total Products"
                    value={totalProducts?.toString() || "0"}
                    icon={ShoppingBag}
                    trend="In Inventory"
                />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <QuickAction
                    href="/admin/products"
                    title="New Product"
                    subtitle="Add items to inventory"
                    icon={Plus}
                />
                <QuickAction
                    href="/admin/users"
                    title="Manage Staff"
                    subtitle="Add workers or admins"
                    icon={Users}
                />
                <QuickAction
                    href="/admin/sales"
                    title="View Transaction History"
                    subtitle="Check past sales"
                    icon={ArrowRight}
                />
            </div>

            {/* Simple CSS Chart (Mockup for now as we lack historical data query in this step) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="mb-6">
                    <h3 className="text-lg font-bold">Weekly Performance</h3>
                </div>
                <div className="h-48 flex items-end justify-between gap-2">
                    {[40, 65, 30, 80, 55, 90, 45].map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col justify-end group">
                            <div
                                className="w-full bg-primary/10 rounded-t-lg group-hover:bg-primary/20 transition-all relative"
                                style={{ height: `${h}%` }}
                            >
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                    {h}%
                                </div>
                            </div>
                            <div className="text-center text-xs text-muted-foreground mt-2">
                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function KPICard({ title, value, icon: Icon, trend, variant = "neutral" }: any) {
    const colors = {
        neutral: "bg-white border-gray-100 text-gray-900",
        success: "bg-white border-gray-100 text-gray-900", // Keep bg white for clean look, accent icon
        warning: "bg-amber-50 border-amber-100 text-amber-900",
        danger: "bg-red-50 border-red-100 text-red-900",
    };

    const iconColors = {
        neutral: "bg-gray-100 text-gray-600",
        success: "bg-green-100 text-green-600",
        warning: "bg-amber-200 text-amber-700",
        danger: "bg-red-200 text-red-700",
    };

    return (
        <div className={cn("p-6 rounded-2xl shadow-sm border flex flex-col justify-between", colors[variant as keyof typeof colors])}>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <h3 className="text-3xl font-bold mt-1 tracking-tight">{value}</h3>
                </div>
                <div className={cn("p-2 rounded-xl", iconColors[variant as keyof typeof iconColors])}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>
            <div className="text-xs font-medium opacity-80">
                {trend}
            </div>
        </div>
    );
}

function QuickAction({ href, title, subtitle, icon: Icon }: any) {
    return (
        <Link
            href={href}
            className="group flex items-center gap-4 p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-primary/20 transition-all"
        >
            <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <h4 className="font-bold text-gray-900 group-hover:text-primary transition-colors">{title}</h4>
                <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>
        </Link>
    );
}
