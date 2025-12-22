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
        <div className="space-y-12 max-w-7xl mx-auto pb-12" dir="rtl">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">تحليلات المبيعات</h1>
                    <p className="text-slate-500 font-medium mt-2">نظرة شاملة على أداء متجرك ومعدل النمو</p>
                </div>
                <div className="flex items-center gap-3 bg-white/50 dark:bg-slate-800/50 glass p-2 rounded-[1.5rem] shadow-sm">
                    <div className="bg-primary p-3 rounded-xl text-white shadow-lg shadow-primary/30">
                        <Calendar className="w-5 h-5" />
                    </div>
                    <div className="pl-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">الفترة الحالية</p>
                        <p className="text-sm font-black text-slate-900 dark:text-white mt-1">عام 2024</p>
                    </div>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <ModernMetricCard
                    title="إجمالي الإيرادات"
                    value={totalRevenue}
                    icon={DollarSign}
                    trend="+12.5%"
                    isPositive={true}
                    color="primary"
                />
                <ModernMetricCard
                    title="إجمالي الأرباح"
                    value={totalProfit}
                    icon={TrendingUp}
                    trend={`+${profitMargin.toFixed(1)}%`}
                    isPositive={true}
                    color="emerald"
                />
                <ModernMetricCard
                    title="متوسط الطلب"
                    value={averageOrderValue}
                    icon={ShoppingBag}
                    trend="-2.4%"
                    isPositive={false}
                    color="indigo"
                />
                <ModernMetricCard
                    title="العمليات"
                    value={sales?.length || 0}
                    icon={PieChart}
                    trend="+56"
                    isPositive={true}
                    color="amber"
                    noCurrency={true}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Store Breakdown */}
                <Card className="lg:col-span-1 rounded-[2.5rem] border-0 glass dark:glass-dark shadow-premium overflow-hidden">
                    <CardHeader className="p-8 border-b border-slate-100 dark:border-white/5 bg-slate-50/50">
                        <CardTitle className="text-xl font-black flex items-center gap-4 text-slate-900 dark:text-white">
                            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                                <StoreIcon className="w-6 h-6" />
                            </div>
                            الأداء حسب المتجر
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-slate-100 dark:border-white/5 hover:bg-transparent h-16">
                                        <TableHead className="text-right font-black text-slate-400 uppercase tracking-widest text-[10px] pr-8">المتجر</TableHead>
                                        <TableHead className="text-right font-black text-slate-400 uppercase tracking-widest text-[10px]">المبيعات</TableHead>
                                        <TableHead className="text-left font-black text-emerald-500 uppercase tracking-widest text-[10px] pl-8">الأرباح</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {Array.from(storeStats.entries()).map(([name, stats]) => (
                                        <TableRow key={name} className="border-slate-100 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 h-20 transition-colors">
                                            <TableCell className="font-black text-slate-900 dark:text-white pr-8 text-base">{name}</TableCell>
                                            <TableCell className="font-bold text-slate-600 dark:text-slate-400 font-mono italic">{stats.revenue.toFixed(0)} DH</TableCell>
                                            <TableCell className="text-left font-black text-emerald-500 pl-8 tracking-tighter text-lg">+{stats.profit.toFixed(0)} DH</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Top Products */}
                <Card className="lg:col-span-2 rounded-[2.5rem] border-0 glass dark:glass-dark shadow-premium overflow-hidden">
                    <CardHeader className="p-8 border-b border-slate-100 dark:border-white/5 bg-slate-50/50">
                        <CardTitle className="text-xl font-black flex items-center gap-4 text-slate-900 dark:text-white">
                            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500">
                                <BarChart3 className="w-6 h-6" />
                            </div>
                            أكثر المنتجات مبيعاً
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table className="min-w-[600px] lg:min-w-full">
                                <TableHeader>
                                    <TableRow className="border-slate-100 dark:border-white/5 hover:bg-transparent h-16">
                                        <TableHead className="text-right font-black text-slate-400 uppercase tracking-widest text-[10px] pr-8">المنتج</TableHead>
                                        <TableHead className="text-center font-black text-slate-400 uppercase tracking-widest text-[10px]">الكمية</TableHead>
                                        <TableHead className="text-right font-black text-slate-400 uppercase tracking-widest text-[10px]">الإيرادات</TableHead>
                                        <TableHead className="text-left font-black text-emerald-500 uppercase tracking-widest text-[10px] pl-8">صافي الربح</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {topProducts.map((p, i) => (
                                        <TableRow key={i} className="border-slate-100 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 h-24 transition-colors">
                                            <TableCell className="pr-8">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/5 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                                                        {p.image_url ? (
                                                            <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <PackageIcon className="w-6 h-6 text-slate-200" />
                                                        )}
                                                    </div>
                                                    <span className="font-black text-slate-900 dark:text-white text-lg tracking-tight">{p.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-black">
                                                    {p.quantity} قطعة
                                                </span>
                                            </TableCell>
                                            <TableCell className="font-bold text-slate-500 font-mono italic text-sm">{p.revenue.toFixed(2)} DH</TableCell>
                                            <TableCell className="text-left font-black text-emerald-500 pl-8 tracking-tighter text-xl">+{p.profit.toFixed(0)} DH</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function ModernMetricCard({ title, value, icon: Icon, trend, isPositive, color, noCurrency }: any) {
    const colorClasses: Record<string, string> = {
        primary: "bg-primary/10 text-primary",
        emerald: "bg-emerald-500/10 text-emerald-500",
        indigo: "bg-indigo-500/10 text-indigo-500",
        amber: "bg-amber-500/10 text-amber-500",
    };

    return (
        <Card className="rounded-[2.5rem] border-0 glass dark:glass-dark shadow-premium overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            <CardContent className="p-8">
                <div className="flex justify-between items-start">
                    <div className={cn("p-4 rounded-2xl shadow-sm transition-transform group-hover:scale-110", colorClasses[color] || colorClasses.primary)}>
                        <Icon className="w-8 h-8" />
                    </div>
                    {trend && (
                        <div className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase",
                            isPositive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                        )}>
                            {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {trend}
                        </div>
                    )}
                </div>
                <div className="mt-8">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{title}</p>
                    <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums">
                        {typeof value === 'number' ? value.toFixed(0) : value}
                        {!noCurrency && <span className="text-lg ml-1 font-bold text-slate-400">DH</span>}
                    </h3>
                </div>
            </CardContent>
        </Card>
    );
}
