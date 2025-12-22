import { createClient } from "@/utils/supabase/server";
import { DollarSign, ShoppingBag, TrendingUp, AlertTriangle, Plus, Users, ArrowRight, Calendar } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
        <div className="space-y-10 max-w-7xl mx-auto pb-12" dir="rtl">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                        لوحة التحكم
                    </h1>
                    <p className="text-slate-500 font-medium mt-2 text-lg">نظرة عامة على أداء متجرك اليوم</p>
                </div>
                <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-premium border border-slate-100 dark:border-white/5">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <Calendar className="w-5 h-5" />
                    </div>
                    <div className="px-2">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">اليوم</p>
                        <p className="text-sm font-black text-slate-900 dark:text-white">
                            {new Date().toLocaleDateString('ar-MA', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    title="مبيعات اليوم"
                    value={`${totalSalesToday.toFixed(2)} DH`}
                    icon={DollarSign}
                    trend="إجمالي المحصلة"
                    color="indigo"
                />
                <KPICard
                    title="صافي الأرباح"
                    value={`${totalProfitToday.toFixed(2)} DH`}
                    icon={TrendingUp}
                    trend="أرباح اليوم"
                    color="emerald"
                />
                <KPICard
                    title="نواقص المخزون"
                    value={lowStockCount?.toString() || "0"}
                    icon={AlertTriangle}
                    trend="تحتاج لإعادة ملء"
                    color={lowStockCount && lowStockCount > 0 ? "rose" : "slate"}
                />
                <KPICard
                    title="إجمالي المنتجات"
                    value={totalProducts?.toString() || "0"}
                    icon={ShoppingBag}
                    trend="في المستودع"
                    color="amber"
                />
            </div>

            {/* Main Sections Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Left: Charts/Performance */}
                <div className="xl:col-span-2 space-y-8">
                    <div className="glass dark:glass-dark p-8 rounded-[2.5rem] shadow-premium relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-primary/10 transition-colors" />

                        <div className="relative">
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">الأداء الأسبوعي</h3>
                                    <p className="text-slate-500 font-medium">مراقبة المبيعات على مدار 7 أيام</p>
                                </div>
                                <select className="bg-slate-50 dark:bg-slate-800 border-0 rounded-xl px-4 py-2 font-bold text-sm focus:ring-2 ring-primary/20">
                                    <option>آخر 7 أيام</option>
                                    <option>آخر 30 يوم</option>
                                </select>
                            </div>

                            <div className="h-64 flex items-end justify-between gap-4 md:gap-6">
                                {[40, 65, 30, 80, 55, 90, 45].map((h, i) => (
                                    <div key={i} className="flex-1 flex flex-col justify-end group/bar items-center">
                                        <div
                                            className="w-full max-w-[40px] bg-slate-100 dark:bg-slate-800/50 rounded-2xl group-hover/bar:bg-primary/20 transition-all relative overflow-hidden flex flex-col justify-end min-h-[20px]"
                                            style={{ height: `${h}%` }}
                                        >
                                            <div
                                                className="w-full gradient-primary rounded-t-2xl shadow-[0_-4px_12px_rgba(79,70,229,0.3)]"
                                                style={{ height: '40%' }}
                                            />
                                            <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black py-1 px-2 rounded-lg opacity-0 group-hover/bar:opacity-100 transition-all -translate-y-2 group-hover/bar:translate-y-0">
                                                {h}%
                                            </div>
                                        </div>
                                        <div className="text-[10px] font-black text-slate-400 mt-4 uppercase tracking-widest">
                                            {['الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد'][i]}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <QuickAction
                            href="/admin/products"
                            title="إضافة منتج"
                            subtitle="تحديث المخزون"
                            icon={Plus}
                            color="indigo"
                        />
                        <QuickAction
                            href="/admin/users"
                            title="إدارة الموظفين"
                            subtitle="الصلاحيات والمستخدمين"
                            icon={Users}
                            color="emerald"
                        />
                        <QuickAction
                            href="/admin/sales"
                            title="سجل المبيعات"
                            subtitle="مراجعة العمليات"
                            icon={ArrowRight}
                            color="slate"
                        />
                    </div>
                </div>

                {/* Right: Activity/Stats */}
                <div className="xl:col-span-1 space-y-8">
                    <div className="glass dark:glass-dark p-8 rounded-[2.5rem] shadow-premium h-full flex flex-col">
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6">نشاط المتجر</h3>
                        <div className="space-y-6 flex-1">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="flex gap-4 items-start group cursor-pointer">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                                        <ShoppingBag className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">تم بيع iPhone 13 Pro Max</p>
                                        <p className="text-xs text-slate-500 font-medium">منذ 15 دقيقة • متجر الرباط</p>
                                    </div>
                                    <div className="text-xs font-black text-emerald-600">
                                        +9,500
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button variant="ghost" className="w-full mt-8 rounded-2xl h-12 font-black text-primary hover:bg-primary/5">
                            مشاهدة الكل
                            <ArrowRight className="w-4 h-4 mr-2" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function KPICard({ title, value, icon: Icon, trend, color }: any) {
    const colors = {
        indigo: "from-indigo-500 to-violet-600 shadow-indigo-200 dark:shadow-none",
        emerald: "from-emerald-500 to-teal-600 shadow-emerald-200 dark:shadow-none",
        rose: "from-rose-500 to-pink-600 shadow-rose-200 dark:shadow-none",
        amber: "from-amber-500 to-orange-600 shadow-amber-200 dark:shadow-none",
        slate: "from-slate-600 to-slate-800 shadow-slate-200 dark:shadow-none",
    };

    return (
        <div className="glass dark:glass-dark p-6 rounded-[2rem] shadow-premium group relative overflow-hidden transition-all hover:-translate-y-1 active:scale-[0.98]">
            {/* Background Accent */}
            <div className={cn("absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity", colors[color as keyof typeof colors])} />

            <div className="relative flex items-center justify-between mb-4">
                <div className={cn("w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white shadow-lg", colors[color as keyof typeof colors])}>
                    <Icon className="w-7 h-7" />
                </div>
                <div className="text-right">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{title}</p>
                    <h3 className="text-2xl font-black mt-1 text-slate-900 dark:text-white tracking-tight">{value}</h3>
                </div>
            </div>
            <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5 px-1">
                <span className={cn("w-2 h-2 rounded-full", {
                    "bg-indigo-500": color === 'indigo',
                    "bg-emerald-500": color === 'emerald',
                    "bg-rose-500": color === 'rose',
                    "bg-amber-500": color === "amber",
                    "bg-slate-500": color === "slate"
                })} />
                {trend}
            </div>
        </div>
    );
}

function QuickAction({ href, title, subtitle, icon: Icon, color }: any) {
    const colorClasses = {
        indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white",
        emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white",
        slate: "bg-slate-50 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400 group-hover:bg-slate-900 group-hover:text-white",
    };

    return (
        <Link
            href={href}
            className="group flex flex-col items-center text-center gap-4 p-8 glass dark:glass-dark rounded-[2rem] shadow-premium hover:shadow-2xl hover:-translate-y-1 transition-all"
        >
            <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm", colorClasses[color as keyof typeof colorClasses])}>
                <Icon className="w-8 h-8" />
            </div>
            <div>
                <h4 className="font-black text-lg text-slate-900 dark:text-white group-hover:text-primary transition-colors">{title}</h4>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">{subtitle}</p>
            </div>
        </Link>
    );
}
