import { createClient } from "@/utils/supabase/server";
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    ShoppingBag,
    Store as StoreIcon,
    Package as PackageIcon,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    PieChart,
    BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function ReportsPage() {
    const supabase = await createClient();

    // 1. Fetch All Sales
    const { data: sales } = await supabase
        .from("sales")
        .select(`*, stores(name)`)
        .eq("status", "active")
        .order("created_at", { ascending: false });

    // 2. Fetch Sale Items for Top Products
    const { data: saleItems } = await supabase
        .from("sale_items")
        .select(`
            quantity,
            unit_price,
            buy_price_snap,
            products(
                template_id,
                product_templates(name, image_url)
            )
        `)
        .returns<any[]>();

    // 3. Overall Totals
    const totalRevenue = sales?.reduce((sum, s) => sum + s.total_price, 0) || 0;
    const totalProfit = sales?.reduce((sum, s) => sum + s.profit, 0) || 0;
    const averageOrderValue = sales?.length ? totalRevenue / sales.length : 0;
    const profitMargin = totalRevenue ? (totalProfit / totalRevenue) * 100 : 0;

    // 4. Sales Per Store
    const storeStats = new Map<string, { revenue: number, profit: number, salesCount: number }>();
    sales?.forEach(s => {
        const storeName = s.stores?.name || "Global";
        if (!storeStats.has(storeName)) {
            storeStats.set(storeName, { revenue: 0, profit: 0, salesCount: 0 });
        }
        const stats = storeStats.get(storeName)!;
        stats.revenue += s.total_price;
        stats.profit += s.profit;
        stats.salesCount += 1;
    });

    // 5. Top Products Analysis
    const productStats = new Map<string, {
        name: string,
        image_url: string | null,
        quantity: number,
        revenue: number,
        profit: number
    }>();

    saleItems?.forEach(item => {
        const template = item.products?.product_templates;
        if (!template) return;
        const name = template.name;
        if (!productStats.has(name)) {
            productStats.set(name, {
                name,
                image_url: template.image_url,
                quantity: 0,
                revenue: 0,
                profit: 0
            });
        }
        const stats = productStats.get(name)!;
        stats.quantity += item.quantity;
        stats.revenue += item.quantity * item.unit_price;
        stats.profit += item.quantity * (item.unit_price - item.buy_price_snap);
    });

    const topProducts = Array.from(productStats.values())
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

    return (
        <div className="space-y-8 md:space-y-12 max-w-7xl mx-auto px-4 md:px-0 pb-20 md:pb-0" dir="rtl">
            {/* Header */}
            <div className="flex flex-col items-center md:items-start justify-between gap-6 px-4 md:px-0 text-center md:text-right">
                <div className="flex flex-col items-center md:items-start">
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">تحليلات المبيعات</h1>
                    <p className="text-sm md:text-base text-slate-500 font-medium mt-2">نظرة شاملة على أداء متجرك ومعدل النمو</p>
                </div>
                <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-2 md:p-2.5 rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="bg-slate-900 dark:bg-white p-2 md:p-3 rounded-xl text-white dark:text-slate-900 shadow-lg shadow-slate-900/10">
                        <Calendar className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    <div className="pl-4">
                        <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">الفترة الحالية</p>
                        <p className="text-xs md:text-sm font-black text-slate-900 dark:text-white mt-1">عام 2024</p>
                    </div>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                <ModernMetricCard
                    title="إجمالي الإيرادات"
                    value={totalRevenue}
                    icon={DollarSign}
                    trend="+12.5%"
                    isPositive={true}
                    color="slate"
                />
                <ModernMetricCard
                    title="إجمالي الأرباح"
                    value={totalProfit}
                    icon={TrendingUp}
                    trend={`+${profitMargin.toFixed(1)}%`}
                    isPositive={true}
                    color="dark"
                />
                <ModernMetricCard
                    title="متوسط الطلب"
                    value={averageOrderValue}
                    icon={ShoppingBag}
                    trend="-2.4%"
                    isPositive={false}
                    color="slate"
                />
                <ModernMetricCard
                    title="العمليات"
                    value={sales?.length || 0}
                    icon={PieChart}
                    trend="+56"
                    isPositive={true}
                    color="dark"
                    noCurrency={true}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Store Breakdown */}
                <Card className="lg:col-span-1 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                    <CardHeader className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                        <CardTitle className="text-base md:text-xl font-black flex items-center gap-4 text-slate-900 dark:text-white">
                            <div className="p-2 md:p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                <StoreIcon className="w-5 h-5 md:w-6 md:h-6" />
                            </div>
                            الأداء حسب المتجر
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 md:p-0">
                        <div className="space-y-3 md:space-y-0">
                            {/* Desktop Header */}
                            <div className="hidden md:grid grid-cols-3 px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 dark:border-slate-800">
                                <div>المتجر</div>
                                <div className="text-center">المبيعات</div>
                                <div className="text-left">الأرباح</div>
                            </div>

                            {Array.from(storeStats.entries()).map(([name, stats]) => (
                                <div key={name} className="flex flex-col md:grid md:grid-cols-3 gap-2 md:gap-4 p-5 md:p-0 md:px-8 md:h-20 items-stretch md:items-center bg-white dark:bg-slate-900 md:bg-transparent rounded-2xl md:rounded-none ring-1 ring-black/5 md:ring-0 shadow-sm md:shadow-none transition-colors md:border-b md:border-slate-100 md:dark:border-slate-800 last:border-0">
                                    <div className="font-black text-slate-900 dark:text-white text-base">{name}</div>
                                    <div className="flex justify-between md:justify-center items-center">
                                        <span className="md:hidden text-[9px] font-black text-slate-400 uppercase tracking-widest">المبيعات:</span>
                                        <span className="font-bold text-slate-600 dark:text-slate-400 font-mono italic">{stats.revenue.toFixed(0)} DH</span>
                                    </div>
                                    <div className="flex justify-between md:justify-end items-center border-t md:border-t-0 border-slate-50 dark:border-slate-800 pt-2 md:pt-0">
                                        <span className="md:hidden text-[9px] font-black text-slate-400 uppercase tracking-widest">الأرباح:</span>
                                        <span className="text-left font-black text-emerald-600 dark:text-emerald-400 tracking-tighter text-lg">+{stats.profit.toFixed(0)} DH</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Top Products */}
                <Card className="lg:col-span-2 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                    <CardHeader className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                        <CardTitle className="text-base md:text-xl font-black flex items-center gap-4 text-slate-900 dark:text-white">
                            <div className="p-2 md:p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                <BarChart3 className="w-5 h-5 md:w-6 md:h-6" />
                            </div>
                            أكثر المنتجات مبيعاً
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 md:p-0">
                        <div className="space-y-4 md:space-y-0">
                            {/* Desktop Header */}
                            <div className="hidden md:grid grid-cols-4 px-10 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 dark:border-slate-800">
                                <div>المنتج</div>
                                <div className="text-center">الكمية</div>
                                <div className="text-center">الإيرادات</div>
                                <div className="text-left">الربح</div>
                            </div>

                            {topProducts.map((p, i) => (
                                <div key={i} className="flex flex-col md:grid md:grid-cols-4 gap-4 md:gap-4 p-5 md:p-4 md:px-10 items-stretch md:items-center bg-white dark:bg-slate-900 md:bg-transparent rounded-2xl md:rounded-none ring-1 ring-black/5 md:ring-0 shadow-sm md:shadow-none hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors md:border-b md:border-slate-100 md:dark:border-slate-800 last:border-0 h-auto md:h-24">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                                            {p.image_url ? (
                                                <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <PackageIcon className="w-5 h-5 md:w-6 md:h-6 text-slate-200" />
                                            )}
                                        </div>
                                        <span className="font-black text-slate-900 dark:text-white text-base md:text-lg tracking-tight">{p.name}</span>
                                    </div>
                                    <div className="flex justify-between md:justify-center items-center">
                                        <span className="md:hidden text-[9px] font-black text-slate-400 uppercase tracking-widest">الكمية:</span>
                                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 md:px-4 py-1 rounded-full text-[10px] md:text-xs font-black">
                                            {p.quantity} قطعة
                                        </span>
                                    </div>
                                    <div className="flex justify-between md:justify-center items-center">
                                        <span className="md:hidden text-[9px] font-black text-slate-400 uppercase tracking-widest">الإيرادات:</span>
                                        <span className="font-bold text-slate-500 font-mono italic text-xs md:text-sm">{p.revenue.toFixed(0)} DH</span>
                                    </div>
                                    <div className="flex justify-between md:justify-end items-center border-t md:border-t-0 border-slate-50 dark:border-slate-800 pt-2 md:pt-0">
                                        <span className="md:hidden text-[9px] font-black text-slate-400 uppercase tracking-widest">الربح:</span>
                                        <span className="text-left font-black text-emerald-600 dark:text-emerald-400 md:pl-0 tracking-tighter text-lg md:text-xl">+{p.profit.toFixed(0)} DH</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function ModernMetricCard({ title, value, icon: Icon, trend, isPositive, color, noCurrency }: any) {
    const variants = {
        slate: {
            bg: "bg-slate-50 dark:bg-slate-800/50",
            iconBg: "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-100 dark:ring-slate-700",
            glow: "bg-slate-400/5"
        },
        dark: {
            bg: "bg-slate-900 text-white",
            iconBg: "bg-slate-800 text-white shadow-lg ring-1 ring-white/10",
            glow: "bg-white/5"
        }
    };

    const config = variants[color as keyof typeof variants] || variants.slate;
    const isDark = color === 'dark';

    return (
        <Card className={cn(
            "rounded-[2rem] md:rounded-[2.5rem] border-0 shadow-sm overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative",
            config.bg
        )}>
            <div className={cn("absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl group-hover:opacity-40 transition-opacity duration-700", config.glow)} />
            <CardContent className="p-5 md:p-8 relative z-10">
                <div className="flex justify-between items-start mb-4 md:mb-8">
                    <div className={cn("p-2.5 md:p-4 rounded-xl md:rounded-2xl transition-transform group-hover:scale-110", config.iconBg)}>
                        <Icon className="w-6 h-6 md:w-8 md:h-8" />
                    </div>
                    {trend && (
                        <div className={cn(
                            "flex items-center gap-1 px-2 py-1 rounded-xl text-[8px] md:text-[10px] font-black tracking-widest uppercase",
                            isPositive
                                ? (isDark ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-50 text-emerald-600")
                                : (isDark ? "bg-rose-500/20 text-rose-400" : "bg-rose-50 text-rose-600")
                        )}>
                            {isPositive ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
                            {trend}
                        </div>
                    )}
                </div>
                <div>
                    <p className={cn("text-[8px] md:text-[10px] font-black uppercase tracking-widest md:tracking-[0.2em] mb-1 md:mb-2", isDark ? "text-slate-400" : "text-slate-400")}>{title}</p>
                    <h3 className={cn("text-xl md:text-3xl font-black tracking-tighter tabular-nums leading-none", isDark ? "text-white" : "text-slate-900 dark:text-white")}>
                        {typeof value === 'number' ? value.toFixed(0) : value}
                        {!noCurrency && <span className="text-[10px] md:text-base ml-1 font-bold opacity-50">DH</span>}
                    </h3>
                </div>
            </CardContent>
        </Card>
    );
}
