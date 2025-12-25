import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import { Calendar } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { KPICard, KPICardSkeleton, QuickAction } from "@/components/admin/dashboard-components";
import { PerformanceChart, PerformanceChartSkeleton, ActivitySidebar, ActivitySidebarSkeleton } from "@/components/admin/dashboard-charts";

export default async function AdminDashboard() {
    return (
        <div className="space-y-8 md:space-y-10 max-w-7xl mx-auto pb-12" dir="rtl">
            {/* Header - Instant */}
            <div className="flex flex-col items-center md:items-start justify-between gap-6 px-4 md:px-0 text-center md:text-right">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                        لوحة التحكم
                    </h1>
                    <p className="text-slate-500 font-medium mt-2 text-sm md:text-lg">نظرة عامة على أداء متجرك اليوم</p>
                </div>
                <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-premium border border-slate-100 dark:border-white/5">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <Calendar className="w-5 h-5" />
                    </div>
                    <div className="px-2">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">اليوم</p>
                        <p className="text-xs md:text-sm font-black text-slate-900 dark:text-white mt-1">
                            {new Date().toLocaleDateString('ar-MA', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                    </div>
                </div>
            </div>

            {/* KPI Cards - Streaming */}
            <Suspense fallback={
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[...Array(4)].map((_, i) => <KPICardSkeleton key={i} />)}
                </div>
            }>
                <KPICardsData />
            </Suspense>

            {/* Main Sections Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Left: Charts/Performance */}
                <div className="xl:col-span-2 space-y-8">
                    <Suspense fallback={<PerformanceChartSkeleton />}>
                        <PerformanceChartData />
                    </Suspense>

                    {/* Quick Actions - Instant */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <QuickAction href="/admin/products" title="إضافة منتج" subtitle="تحديث المخزون" icon="Plus" color="indigo" />
                        <QuickAction href="/admin/users" title="إدارة الموظفين" subtitle="الصلاحيات والمستخدمين" icon="Users" color="emerald" />
                        <QuickAction href="/admin/sales" title="سجل المبيعات" subtitle="مراجعة العمليات" icon="ArrowRight" color="slate" />
                    </div>
                </div>

                {/* Right: Activity/Stats */}
                <div className="xl:col-span-1 space-y-8">
                    <Suspense fallback={<ActivitySidebarSkeleton />}>
                        <ActivitySidebarData />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}

// --- DATA FETCHING SUB-COMPONENTS ---

async function KPICardsData() {
    const supabase = await createClient();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [salesResult, lowStockResult, productsResult] = await Promise.all([
        supabase.from("sales").select("total_price, profit").eq("status", "active").gte("created_at", today.toISOString()).lt("created_at", tomorrow.toISOString()),
        supabase.from("products").select("*", { count: 'exact', head: true }).lt("stock", 5),
        supabase.from("products").select("*", { count: 'exact', head: true })
    ]);

    const totalSalesToday = salesResult.data?.reduce((sum, s) => sum + (s.total_price || 0), 0) || 0;
    const totalProfitToday = salesResult.data?.reduce((sum, s) => sum + (s.profit || 0), 0) || 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 px-4 md:px-0">
            <KPICard title="مبيعات اليوم" value={totalSalesToday} icon="DollarSign" trend="إجمالي المحصلة" color="dark" isCurrency />
            <KPICard title="صافي الأرباح" value={totalProfitToday} icon="TrendingUp" trend="أرباح اليوم" color="emerald" isCurrency />
            <KPICard title="نواقص المخزون" value={lowStockResult.count || 0} icon="AlertTriangle" trend="تحتاج لإعادة ملء" color={lowStockResult.count && lowStockResult.count > 0 ? "rose" : "slate"} />
            <KPICard title="إجمالي المنتجات" value={productsResult.count || 0} icon="ShoppingBag" trend="في المستودع" color="slate" />
        </div>
    );
}

async function PerformanceChartData() {
    const supabase = await createClient();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);

    const { data: weeklySales } = await supabase
        .from("sales")
        .select("total_price, created_at")
        .eq("status", "active")
        .gte("created_at", sevenDaysAgo.toISOString());

    const chartData = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(sevenDaysAgo);
        d.setDate(d.getDate() + i);
        const dayLabel = d.toLocaleDateString('ar-MA', { weekday: 'short' });
        const dateStr = d.toISOString().split('T')[0];
        const dayTotal = weeklySales?.filter(s => s.created_at.startsWith(dateStr)).reduce((sum, s) => sum + (s.total_price || 0), 0) || 0;
        return { label: dayLabel, value: dayTotal };
    });

    const maxWeeklyValue = Math.max(...chartData.map(d => d.value), 100);

    return <PerformanceChart chartData={chartData} maxWeeklyValue={maxWeeklyValue} />;
}

async function ActivitySidebarData() {
    const supabase = await createClient();
    const { data: recentSales } = await supabase
        .from("sales")
        .select(`*, stores(name)`)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(5);

    return <ActivitySidebar recentSales={recentSales} />;
}
