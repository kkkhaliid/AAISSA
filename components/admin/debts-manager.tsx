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
                {/* Custom Card Header - Desktop Only */}
                <div className="grid grid-cols-6 px-10 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 hidden md:grid">
                    <div className="text-right">العميل</div>
                    <div className="text-right">المنتج</div>
                    <div className="text-right">المبلغ</div>
                    <div className="text-right">التاريخ</div>
                    <div className="text-right">الحالة</div>
                    <div className="text-center">إجراءات</div>
                </div>

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
                    filteredDebts.map((debt) => (
                        <div
                            key={debt.id}
                            className="flex flex-col md:grid md:grid-cols-6 gap-4 md:gap-4 items-stretch md:items-center bg-white dark:bg-slate-900 p-5 md:p-4 md:px-10 rounded-[2rem] md:rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-300 ring-1 ring-black/5 dark:ring-white/5 active:scale-[0.99] group overflow-hidden"
                        >
                            {/* Mobile Row 1: Customer & Actions */}
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-primary text-white flex items-center justify-center font-black text-base md:text-lg shadow-lg shadow-primary/20 shrink-0">
                                        {debt.customer_name[0].toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-black text-base text-slate-900 dark:text-white leading-tight truncate">{debt.customer_name}</p>
                                        <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[9px] md:text-[10px] mt-1 uppercase tracking-tighter">
                                            <Phone className="w-3 h-3" />
                                            {debt.phone_number}
                                        </div>
                                    </div>
                                </div>

                                {/* Desktop Actions will go in the 6th col, so we need a spacer on mobile or the dropdown */}
                                <div className="flex md:hidden items-center gap-2">
                                    {getStatusBadge(debt.status)}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-400">
                                                <MoreVertical className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48 rounded-2xl border-0 ring-1 ring-black/5 shadow-premium p-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
                                            <DropdownMenuItem
                                                className="flex items-center gap-3 p-2.5 rounded-xl font-bold transition-colors focus:bg-primary/5 focus:text-primary"
                                                onClick={() => {
                                                    setSelectedDebt(debt);
                                                    setIsDialogOpen(true);
                                                }}
                                            >
                                                <Edit2 className="w-4 h-4" />
                                                تحديث الدفع
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="flex items-center gap-3 p-2.5 rounded-xl font-bold text-rose-500 focus:bg-rose-50 dark:focus:bg-rose-950/30 transition-colors"
                                                onClick={() => handleDelete(debt.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                حذف السجل
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            {/* Mobile Row 2: Product & Date */}
                            <div className="flex items-center justify-between gap-4 md:contents border-t md:border-t-0 border-slate-50 dark:border-white/5 pt-4 md:pt-0">
                                {/* Product */}
                                <div className="flex md:block items-center gap-2">
                                    <span className="md:hidden text-[8px] font-black text-slate-400 uppercase tracking-widest">المنتج:</span>
                                    {debt.product_templates ? (
                                        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 ring-1 ring-black/5">
                                            <Package className="w-3 h-3 text-slate-400" />
                                            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 truncate max-w-[100px]">{debt.product_templates.name}</span>
                                        </div>
                                    ) : (
                                        <span className="text-slate-300 dark:text-slate-600">---</span>
                                    )}
                                </div>

                                {/* Date */}
                                <div className="flex md:block items-center gap-2 font-bold text-[10px] md:text-sm text-slate-500 dark:text-slate-400">
                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                    {new Date(debt.due_date).toLocaleDateString('ar-MA', { day: 'numeric', month: 'short' })}
                                </div>
                            </div>

                            {/* Mobile Row 3: Progress & Amount */}
                            <div className="space-y-3 w-full md:col-span-1">
                                <div className="flex items-baseline justify-between md:justify-end">
                                    <span className="md:hidden text-[8px] font-black text-slate-400 uppercase tracking-widest">المبلغ</span>
                                    <div className="text-right">
                                        <span className="font-black text-xl md:text-lg tracking-tighter text-slate-900 dark:text-white">
                                            {debt.total_amount.toLocaleString()} <span className="text-[10px] text-primary">DH</span>
                                        </span>
                                    </div>
                                </div>
                                <div className="w-full h-1.5 md:h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 ring-1 ring-black/5">
                                    <div
                                        className={cn(
                                            "h-full rounded-full transition-all duration-1000 ease-out shadow-sm",
                                            (debt.paid_amount / debt.total_amount) >= 1 ? "bg-emerald-500" : "bg-primary"
                                        )}
                                        style={{ width: `${(debt.paid_amount / debt.total_amount) * 100}%` }}
                                    />
                                </div>
                            </div>

                            {/* Status (Desktop only component already handled above for mobile) */}
                            <div className="hidden md:flex justify-end">
                                {getStatusBadge(debt.status)}
                            </div>

                            {/* Actions (Desktop only) */}
                            <div className="hidden md:flex justify-center">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-12 w-12 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 transition-all">
                                            <MoreVertical className="w-5 h-5" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56 rounded-[1.5rem] border-0 ring-1 ring-black/5 dark:ring-white/10 shadow-premium p-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
                                        <DropdownMenuItem
                                            className="flex items-center gap-3 p-3 rounded-xl font-bold cursor-pointer transition-colors focus:bg-primary/5 focus:text-primary"
                                            onClick={() => {
                                                setSelectedDebt(debt);
                                                setIsDialogOpen(true);
                                            }}
                                        >
                                            <div className="p-1.5 rounded-lg bg-primary/10">
                                                <Edit2 className="w-4 h-4" />
                                            </div>
                                            تحديث الدفع
                                        </DropdownMenuItem>
                                        <div className="my-1 border-t border-slate-50 dark:border-white/5" />
                                        <DropdownMenuItem
                                            className="flex items-center gap-3 p-3 rounded-xl font-bold text-rose-500 cursor-pointer transition-colors focus:bg-rose-50 dark:focus:bg-rose-950/30 focus:text-rose-600"
                                            onClick={() => handleDelete(debt.id)}
                                        >
                                            <div className="p-1.5 rounded-lg bg-rose-500/10">
                                                <Trash2 className="w-4 h-4" />
                                            </div>
                                            حذف السجل
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    ))
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
