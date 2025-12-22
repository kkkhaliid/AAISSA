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
    ArrowDownRight
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
        <div className="space-y-8 max-w-7xl mx-auto" dir="rtl">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">تقارير المبيعات</h1>
                <p className="text-muted-foreground mt-1 text-lg">تحليل أداء المتجر والأرباح وإحصائيات المنتجات</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="إجمالي الإيرادات"
                    value={`${totalRevenue.toFixed(2)} DH`}
                    icon={DollarSign}
                    subValue="إجمالي المبيعات النشطة"
                    color="primary"
                />
                <MetricCard
                    title="إجمالي الأرباح"
                    value={`${totalProfit.toFixed(2)} DH`}
                    icon={TrendingUp}
                    subValue={`${profitMargin.toFixed(1)}% هامش الربح`}
                    color="success"
                />
                <MetricCard
                    title="متوسط قيمة الطلب"
                    value={`${averageOrderValue.toFixed(2)} DH`}
                    icon={ShoppingBag}
                    subValue={`من ${sales?.length || 0} عملية بيع`}
                    color="blue"
                />
                <MetricCard
                    title="إجمالي العمليات"
                    value={sales?.length?.toString() || "0"}
                    icon={Calendar}
                    subValue="عمليات بيع ناجحة"
                    color="orange"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Store Breakdown */}
                <Card className="lg:col-span-1 rounded-3xl border-0 shadow-xl shadow-gray-200/50 overflow-hidden">
                    <CardHeader className="bg-gray-50/50 border-b border-gray-100">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <StoreIcon className="w-5 h-5 text-primary" />
                            الأداء حسب المتجر
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="text-right">المتجر</TableHead>
                                    <TableHead className="text-right">المبيعات</TableHead>
                                    <TableHead className="text-left font-bold text-emerald-600">الأرباح</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Array.from(storeStats.entries()).map(([name, stats]) => (
                                    <TableRow key={name} className="hover:bg-gray-50/30">
                                        <TableCell className="font-bold">{name}</TableCell>
                                        <TableCell>{stats.revenue.toFixed(2)}</TableCell>
                                        <TableCell className="text-left font-bold text-emerald-600">+{stats.profit.toFixed(2)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Top Products */}
                <Card className="lg:col-span-2 rounded-3xl border-0 shadow-xl shadow-gray-200/50 overflow-hidden">
                    <CardHeader className="bg-gray-50/50 border-b border-gray-100">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <PackageIcon className="w-5 h-5 text-primary" />
                            أكثر المنتجات مبيعاً
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="text-right pr-6">المنتج</TableHead>
                                    <TableHead className="text-center">الكمية المباعة</TableHead>
                                    <TableHead className="text-right">الإيرادات</TableHead>
                                    <TableHead className="text-left font-bold text-emerald-600 ml-4">صافي الربح</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {topProducts.map((p, i) => (
                                    <TableRow key={i} className="hover:bg-gray-50/30">
                                        <TableCell className="pr-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                                                    {p.image_url ? (
                                                        <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <PackageIcon className="w-4 h-4 text-gray-400" />
                                                    )}
                                                </div>
                                                <span className="font-bold text-gray-900">{p.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center font-bold">
                                            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs">
                                                {p.quantity} قطعة
                                            </span>
                                        </TableCell>
                                        <TableCell className="font-mono text-sm">{p.revenue.toFixed(2)} DH</TableCell>
                                        <TableCell className="text-left font-bold text-emerald-600">+{p.profit.toFixed(2)} DH</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function MetricCard({ title, value, icon: Icon, subValue, color }: any) {
    const colorMap = {
        primary: "text-primary bg-primary/5",
        success: "text-emerald-600 bg-emerald-50",
        blue: "text-blue-600 bg-blue-50",
        orange: "text-orange-600 bg-orange-50",
    };

    return (
        <Card className="rounded-3xl border-0 shadow-lg shadow-gray-200/50 bg-white">
            <CardContent className="p-6">
                <div className="flex justify-between items-start">
                    <div className={cn("p-3 rounded-2xl", colorMap[color as keyof typeof colorMap])}>
                        <Icon className="w-6 h-6" />
                    </div>
                </div>
                <div className="mt-4">
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <h3 className="text-2xl font-bold mt-1 tracking-tight">{value}</h3>
                    <p className="text-xs font-semibold mt-2 opacity-70 flex items-center gap-1">
                        {subValue}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
