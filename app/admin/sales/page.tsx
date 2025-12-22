import { createClient } from "@/utils/supabase/server";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RotateCcw, ShoppingCart, Calendar, User, Store, DollarSign, TrendingUp } from "lucide-react";
import { undoSale } from "./actions";
import { Badge } from "@/components/ui/badge";
import { ActionButton } from "@/components/admin/action-button";
import { cn } from "@/lib/utils";

export default async function SalesPage() {
    const supabase = await createClient();

    const { data: sales } = await supabase
        .from("sales")
        .select(`
            *,
            stores(name),
            profiles(full_name)
        `)
        .order("created_at", { ascending: false });

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Transaction History</h1>
                    <p className="text-muted-foreground mt-1">Review and manage your store sales records</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
                        <DollarSign className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Historical Revenue</p>
                        <h3 className="text-2xl font-bold text-gray-900">
                            {sales?.filter(s => s.status === 'active').reduce((sum, s) => sum + s.total_price, 0).toFixed(2)} DH
                        </h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Net Profit</p>
                        <h3 className="text-2xl font-bold text-gray-900">
                            {sales?.filter(s => s.status === 'active').reduce((sum, s) => sum + s.profit, 0).toFixed(2)} DH
                        </h3>
                    </div>
                </div>
            </div>

            {/* Sales Table Container */}
            <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-50/50">
                        <TableRow className="hover:bg-transparent border-gray-100">
                            <TableHead className="w-[200px] text-gray-500 font-semibold py-4">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" /> Date
                                </div>
                            </TableHead>
                            <TableHead className="text-gray-500 font-semibold">
                                <div className="flex items-center gap-2">
                                    <Store className="w-4 h-4" /> Store
                                </div>
                            </TableHead>
                            <TableHead className="text-gray-500 font-semibold">
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4" /> Worker
                                </div>
                            </TableHead>
                            <TableHead className="text-gray-500 font-semibold">
                                <div className="flex items-center gap-2">
                                    <DollarSign className="w-4 h-4" /> Total Price
                                </div>
                            </TableHead>
                            <TableHead className="text-gray-500 font-semibold">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4" /> Profit
                                </div>
                            </TableHead>
                            <TableHead className="text-gray-500 font-semibold">Status</TableHead>
                            <TableHead className="text-right py-4"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sales?.map((sale) => (
                            <TableRow
                                key={sale.id}
                                className={cn(
                                    "group transition-colors border-gray-50",
                                    sale.status === 'undone' ? 'bg-red-50/30 opacity-70 italic' : 'hover:bg-gray-50/50'
                                )}
                            >
                                <TableCell className="py-4 font-medium text-gray-600">
                                    {new Date(sale.created_at).toLocaleString("en-US", {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </TableCell>
                                <TableCell className="text-gray-600 font-medium">
                                    {/* @ts-ignore */}
                                    {sale.stores?.name || "Global"}
                                </TableCell>
                                <TableCell className="text-gray-600">
                                    <div className="flex items-center gap-2 text-sm">
                                        <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-primary font-bold">
                                            {sale.profiles?.full_name?.charAt(0) || "?"}
                                        </div>
                                        {sale.profiles?.full_name || "Unknown"}
                                    </div>
                                </TableCell>
                                <TableCell className="font-bold text-gray-900">
                                    {sale.total_price.toFixed(2)} DH
                                </TableCell>
                                <TableCell className="text-green-600 font-bold">
                                    +{sale.profit.toFixed(2)} DH
                                </TableCell>
                                <TableCell>
                                    {sale.status === 'active' ? (
                                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold">
                                            Success
                                        </Badge>
                                    ) : (
                                        <Badge variant="destructive" className="px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold">
                                            Reversed
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-right py-4">
                                    {sale.status === 'active' && (
                                        <ActionButton
                                            action={undoSale}
                                            id={sale.id}
                                            label="Revert"
                                            className="opacity-0 group-hover:opacity-100 transition-opacity text-orange-600 hover:text-orange-700 hover:bg-orange-50 gap-2 font-bold px-4"
                                        >
                                            <RotateCcw className="w-4 h-4" />
                                        </ActionButton>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                        {sales?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-20 text-gray-400">
                                    <div className="flex flex-col items-center gap-3">
                                        <ShoppingCart className="w-12 h-12 opacity-20" />
                                        <p className="text-lg">No transactions found yet</p>
                                        <p className="text-sm">When workers make sales, they will appear here</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

