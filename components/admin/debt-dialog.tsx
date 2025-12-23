"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, User, Phone, Package, Calendar, CreditCard, NotebookText, X } from "lucide-react";
import { createDebt, updateDebtPayment, Debt } from "@/app/admin/debts/actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";

interface DebtDialogProps {
    debt?: Debt | null;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    showTrigger?: boolean;
}

export function DebtDialog({ debt, open: externalOpen, onOpenChange: setExternalOpen, showTrigger = true }: DebtDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const open = externalOpen !== undefined ? externalOpen : internalOpen;
    const setOpen = setExternalOpen || setInternalOpen;
    const [loading, setLoading] = useState(false);
    const [templates, setTemplates] = useState<{ id: string; name: string }[]>([]);
    const isEdit = !!debt;

    useEffect(() => {
        const fetchTemplates = async () => {
            const supabase = createClient();
            const { data } = await supabase.from("product_templates").select("id, name").order("name");
            if (data) setTemplates(data);
        };
        fetchTemplates();
    }, []);

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (loading) return;

        const formData = new FormData(e.currentTarget);
        setLoading(true);

        try {
            const result = isEdit
                ? await updateDebtPayment(debt.id, parseFloat(formData.get("payment_amount") as string) || 0)
                : await createDebt(formData);

            if (result && 'error' in result) {
                toast.error(result.error);
            } else {
                toast.success(isEdit ? "تم تحديث الدفع بنجاح" : "تم إضافة سجل الدين بنجاح");
                setOpen(false);
            }
        } catch (err) {
            console.error(err);
            toast.error("حدث خطأ غير متوقع");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {showTrigger && !isEdit && (
                <DialogTrigger asChild>
                    <Button className="group relative overflow-hidden gap-3 h-14 px-8 rounded-2xl bg-slate-900 border-0 dark:bg-white dark:text-slate-900 shadow-xl shadow-slate-900/10 font-bold text-base active:scale-95 transition-all text-white hover:bg-slate-800 dark:hover:bg-slate-100">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/10 to-primary/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        <Plus className="w-6 h-6" />
                        <span>تسجيل دين جديد</span>
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="max-w-[80vw] sm:max-w-[80vw] w-full h-[70vh] max-h-[800px] flex flex-col p-0 gap-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl border-0 ring-1 ring-slate-200/50 dark:ring-slate-700/50 shadow-2xl rounded-2xl overflow-hidden [&>button]:hidden" dir="rtl">

                {/* Header */}
                <DialogHeader className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-l from-slate-50/80 via-white/80 to-slate-50/80 dark:from-slate-900/80 dark:via-slate-900/95 dark:to-slate-900/80 flex flex-row items-center justify-between shrink-0 z-20">
                    <div className="flex flex-col gap-1 items-start">
                        <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                                {isEdit ? <CreditCard className="w-6 h-6" /> : <User className="w-6 h-6" />}
                            </div>
                            {isEdit ? "تحديث الدفعة" : "إضافة دين جديد"}
                        </DialogTitle>
                        <p className="text-slate-500 font-medium text-sm">
                            {isEdit ? `تسجيل دفعة جديدة للعميل ${debt.customer_name}` : "قم بتعبئة بيانات العميل والمبلغ المستحق"}
                        </p>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setOpen(false)}
                        className="rounded-full w-10 h-10 bg-slate-100 dark:bg-slate-800 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </DialogHeader>

                <form onSubmit={onSubmit} className="flex flex-col flex-1 overflow-hidden">
                    {/* Scrollable Body */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                        {!isEdit ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Customer Data Section */}
                                <div className="space-y-6">
                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                        <User className="w-4 h-4" /> بيانات العميل
                                    </h3>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-slate-500 font-bold text-xs mr-1">اسم العميل</Label>
                                            <Input
                                                name="customer_name"
                                                required
                                                placeholder="الاسم الكامل"
                                                className="h-12 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all font-bold"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-slate-500 font-bold text-xs mr-1">رقم الهاتف</Label>
                                            <div className="relative">
                                                <Input
                                                    name="phone_number"
                                                    required
                                                    placeholder="06XXXXXXXX"
                                                    className="h-12 pl-10 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all font-mono font-bold text-sm"
                                                    dir="ltr"
                                                />
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-slate-500 font-bold text-xs mr-1">ملاحظات إضافية</Label>
                                        <Textarea
                                            name="notes"
                                            placeholder="أية تفاصيل أخرى..."
                                            className="min-h-[120px] bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all font-medium resize-none text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Debt Details Section */}
                                <div className="space-y-6">
                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                        <CreditCard className="w-4 h-4" /> تفاصيل الدين
                                    </h3>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-slate-500 font-bold text-xs mr-1">المنتج (اختياري)</Label>
                                            <Select name="template_id">
                                                <SelectTrigger className="h-12 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all font-medium text-right">
                                                    <SelectValue placeholder="اختر المنتج..." />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl border-slate-100 dark:border-slate-800 shadow-xl max-h-[200px]" dir="rtl">
                                                    {templates.map(t => (
                                                        <SelectItem key={t.id} value={t.id} className="font-medium text-right">{t.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-slate-500 font-bold text-xs mr-1">المبلغ الإجمالي</Label>
                                                <div className="relative">
                                                    <Input
                                                        name="total_amount"
                                                        type="number"
                                                        step="0.01"
                                                        required
                                                        placeholder="0.00"
                                                        className="h-12 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all text-lg font-black text-center pr-12"
                                                    />
                                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">DH</span>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-slate-500 font-bold text-xs mr-1">المبلغ المدفوع</Label>
                                                <div className="relative">
                                                    <Input
                                                        name="paid_amount"
                                                        type="number"
                                                        step="0.01"
                                                        placeholder="0.00"
                                                        className="h-12 bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all text-lg font-black text-center pr-12 text-emerald-600 dark:text-emerald-400"
                                                    />
                                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500/70 font-bold text-sm">DH</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-slate-500 font-bold text-xs mr-1">تاريخ الاستحقاق</Label>
                                            <Input
                                                name="due_date"
                                                type="date"
                                                required
                                                className="h-12 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all font-medium text-right"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="max-w-xl mx-auto space-y-8 pt-4">
                                <div className="p-8 bg-slate-50 dark:bg-slate-900 rounded-3xl space-y-6 border border-slate-100 dark:border-slate-800">
                                    <div className="flex justify-between items-end">
                                        <div className="space-y-1">
                                            <span className="text-slate-500 font-bold text-sm">المبلغ المتبقي</span>
                                            <p className="text-4xl font-black text-rose-500 tracking-tight">{(debt.total_amount - debt.paid_amount).toLocaleString()} <span className="text-xl">DH</span></p>
                                        </div>
                                        <div className="h-10 px-4 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                                            <span className="text-emerald-600 dark:text-emerald-400 font-black">
                                                نسبة السداد: {Math.round((debt.paid_amount / debt.total_amount) * 100)}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                                        <div
                                            className="h-full bg-emerald-500 transition-all duration-1000 ease-out"
                                            style={{ width: `${(debt.paid_amount / debt.total_amount) * 100}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                            تم دفع: {debt.paid_amount.toLocaleString()} DH
                                        </div>
                                        <div>الإجمالي: {debt.total_amount.toLocaleString()} DH</div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <Label className="flex items-center gap-3 text-slate-900 dark:text-slate-200 font-black text-lg mr-1 tracking-tight">
                                        <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                                            <CreditCard className="w-5 h-5" />
                                        </div>
                                        مبلغ الدفعة الجديدة
                                    </Label>
                                    <div className="relative group">
                                        <Input
                                            name="payment_amount"
                                            type="number"
                                            step="0.01"
                                            required
                                            placeholder="0.00"
                                            autoFocus
                                            className="h-28 bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-sm text-6xl font-black text-center pr-28 text-emerald-600 focus:ring-8 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all tabular-nums"
                                        />
                                        <span className="absolute right-12 top-1/2 -translate-y-1/2 text-slate-300 font-black text-2xl tracking-tighter">DH</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer - Sticky */}
                    <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md flex flex-row items-center justify-end gap-3 shrink-0 z-20">
                        <Button
                            type="button"
                            variant="ghost"
                            className="h-12 px-6 rounded-xl font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                            onClick={() => setOpen(false)}
                        >
                            إلغاء
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="h-12 px-8 rounded-xl bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 text-lg font-bold shadow-lg shadow-slate-900/10 text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {loading ? "جاري الحفظ..." : (isEdit ? "تأكيد وتحديث الدفع" : "حفظ سجل الدين")}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
