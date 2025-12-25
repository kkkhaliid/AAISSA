"use client";

import { useState, useMemo } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Search,
    Filter,
    MoreVertical,
    Phone,
    Calendar,
    CreditCard,
    CheckCircle2,
    AlertCircle,
    Clock,
    Trash2,
    Edit2,
    Package,
    X
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Debt, deleteDebt } from "@/app/admin/debts/actions";
import { DebtDialog } from "./debt-dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface DebtsManagerProps {
    initialDebts: Debt[];
}

export function DebtsManager({ initialDebts }: DebtsManagerProps) {
    const [debts, setDebts] = useState<Debt[]>(initialDebts);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const filteredDebts = useMemo(() => {
        return debts.filter(debt => {
            const matchesSearch =
                debt.customer_name.toLowerCase().includes(search.toLowerCase()) ||
                debt.phone_number.includes(search);
            const matchesStatus = filterStatus === "all" || debt.status === filterStatus;
            return matchesSearch && matchesStatus;
        });
    }, [debts, search, filterStatus]);

    const handleDelete = async (id: string) => {
        if (!confirm("هل أنت متأكد من حذف هذا السجل؟")) return;
        const result = await deleteDebt(id);
        if (result.success) {
            setDebts(debts.filter(d => d.id !== id));
            toast.success("تم حذف السجل");
        } else {
            toast.error(result.error || "فشل الحذف");
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'paid':
                return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 gap-1.5 px-3 py-1 rounded-full"><CheckCircle2 className="w-3.5 h-3.5" /> مدفوع</Badge>;
            case 'overdue':
                return <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20 gap-1.5 px-3 py-1 rounded-full"><AlertCircle className="w-3.5 h-3.5" /> متأخر</Badge>;
            default:
                return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 gap-1.5 px-3 py-1 rounded-full"><Clock className="w-3.5 h-3.5" /> قادم</Badge>;
        }
    };

    return (
        <div className="space-y-6 md:space-y-8 pb-24 md:pb-0 px-4 md:px-0">
            <div className="flex flex-col md:flex-row gap-4 md:gap-6 justify-between items-stretch md:items-end backdrop-blur-xl bg-white/30 dark:bg-slate-900/30 p-4 md:p-6 rounded-[2rem] md:rounded-[2.5rem] ring-1 ring-white/20 dark:ring-white/5 shadow-premium">
                <div className="flex flex-col md:flex-row gap-4 md:gap-6 w-full md:w-auto flex-1 items-stretch md:items-end">
                    <div className="relative flex-1 max-w-md group w-full">
                        <Search className="absolute right-4 md:right-5 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="بحث بالاسم أو الهاتف..."
                            className="h-12 md:h-14 pr-12 md:pr-14 pl-10 md:pl-12 bg-white dark:bg-slate-950 border-0 ring-1 ring-slate-200 dark:ring-slate-800 rounded-xl md:rounded-2xl shadow-sm focus:ring-2 focus:ring-primary/20 text-sm md:text-base font-bold transition-all"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        {search && (
                            <button
                                onClick={() => setSearch("")}
                                className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Compact Filter Bar for Mobile */}
                    <div className="flex p-1 bg-slate-100/50 dark:bg-slate-800/50 rounded-xl md:rounded-2xl ring-1 ring-black/5 dark:ring-white/5 backdrop-blur-md overflow-x-auto no-scrollbar">
                        {['all', 'upcoming', 'overdue', 'paid'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={cn(
                                    "px-4 md:px-6 py-2 md:py-2.5 rounded-lg md:rounded-xl font-black text-[9px] md:text-xs uppercase tracking-widest transition-all duration-300 whitespace-nowrap",
                                    filterStatus === status
                                        ? "bg-white dark:bg-slate-700 text-primary dark:text-white shadow-premium scale-[1.02]"
                                        : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                )}
                            >
                                {status === 'all' ? 'الكل' :
                                    status === 'upcoming' ? 'قادم' :
                                        status === 'overdue' ? 'متأخر' : 'مدفوع'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Only show trigger on desktop - Mobile uses FAB */}
                <div className="hidden md:block">
                    <DebtDialog />
                </div>
            </div>

            <div className="space-y-4">
                {filteredDebts.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900/50 rounded-[2rem] md:rounded-[2.5rem] p-20 md:p-32 text-center border border-dashed border-slate-200 dark:border-white/5">
                        <div className="flex flex-col items-center gap-6">
                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center ring-1 ring-black/5">
                                <AlertCircle className="w-8 h-8 md:w-10 md:h-10 text-slate-300" />
                            </div>
                            <p className="text-lg md:text-xl font-black text-slate-400">لا توجد سجلات ديون</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                        {filteredDebts.map((debt) => {
                            const isOverdue = debt.status === 'overdue';
                            const percentPaid = (debt.paid_amount / debt.total_amount) * 100;

                            return (
                                <div
                                    key={debt.id}
                                    className="group relative flex flex-col bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ring-1 ring-black/5 dark:ring-white/5 overflow-hidden"
                                >
                                    {/* Urgency Indicator Strip */}
                                    {isOverdue && (
                                        <div className="absolute top-0 right-0 left-0 h-1.5 bg-rose-500" />
                                    )}

                                    {/* Header: Customer */}
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-500/20 shrink-0">
                                                {debt.customer_name[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="font-black text-lg text-slate-900 dark:text-white leading-tight truncate max-w-[140px] md:max-w-[200px]">
                                                    {debt.customer_name}
                                                </h3>
                                                <div className="flex items-center gap-1.5 text-slate-400 font-bold text-xs mt-1">
                                                    <Phone className="w-3.5 h-3.5" />
                                                    {debt.phone_number}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="scale-90 origin-top-left">
                                            {getStatusBadge(debt.status)}
                                        </div>
                                    </div>

                                    {/* Progress Section */}
                                    <div className="mb-6 space-y-2">
                                        <div className="flex justify-between items-end">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">المدفوع</span>
                                            <div className="text-right">
                                                <span className="font-black text-xl text-slate-900 dark:text-white">
                                                    {debt.paid_amount.toLocaleString()}
                                                </span>
                                                <span className="text-xs text-slate-400 font-bold mx-1">/</span>
                                                <span className="text-sm font-bold text-slate-400">
                                                    {debt.total_amount.toLocaleString()} <span className="text-[9px]">DH</span>
                                                </span>
                                            </div>
                                        </div>
                                        <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                                            <div
                                                className={cn(
                                                    "h-full rounded-full transition-all duration-1000 ease-out shadow-sm relative overflow-hidden",
                                                    percentPaid >= 100 ? "bg-emerald-500" : isOverdue ? "bg-rose-500" : "bg-primary"
                                                )}
                                                style={{ width: `${Math.max(percentPaid, 5)}%` }} // Min 5% for visibility
                                            >
                                                <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Details Grid */}
                                    <div className="grid grid-cols-2 gap-4 mb-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4">
                                        <div className="space-y-1">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">المنتج</span>
                                            <div className="font-bold text-sm text-slate-700 dark:text-slate-300 truncate">
                                                {debt.product_templates?.name || "---"}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">تاريخ الاستحقاق</span>
                                            <div className={cn(
                                                "font-bold text-sm",
                                                isOverdue ? "text-rose-500" : "text-slate-700 dark:text-slate-300"
                                            )}>
                                                {new Date(debt.due_date).toLocaleDateString("ar-MA")}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Footer */}
                                    <div className="mt-auto flex gap-2">
                                        <Button
                                            onClick={() => {
                                                setSelectedDebt(debt);
                                                setIsDialogOpen(true);
                                            }}
                                            className="flex-1 rounded-xl font-bold h-11 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 transition-opacity shadow-lg"
                                        >
                                            تحديث الدفع
                                        </Button>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-11 w-11 rounded-xl border border-slate-200 dark:border-white/10 text-slate-400">
                                                    <MoreVertical className="w-5 h-5" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48 rounded-2xl p-1.5">
                                                <DropdownMenuItem
                                                    className="flex items-center gap-3 p-2.5 rounded-xl font-bold text-rose-500 focus:text-rose-600 focus:bg-rose-50"
                                                    onClick={() => handleDelete(debt.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    حذف السجل
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Mobile FAB */}
            <div className="fixed bottom-24 left-6 md:hidden z-50">
                <DebtDialog />
            </div>

            <DebtDialog
                debt={selectedDebt}
                open={isDialogOpen}
                showTrigger={false}
                onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) setSelectedDebt(null);
                }}
            />
        </div>

    );
}
