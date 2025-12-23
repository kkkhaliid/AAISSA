"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Store, MapPin, X } from "lucide-react";
import { createStore } from "@/app/admin/actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function StoreDialog() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        try {
            const result = await createStore(formData);
            if (result && 'error' in result) {
                toast.error(result.error as string);
            } else {
                toast.success("تم إضافة المتجر بنجاح");
                setOpen(false);
            }
        } catch (err: any) {
            toast.error("حدث خطأ غير متوقع");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-3 h-14 px-8 rounded-2xl gradient-primary shadow-xl shadow-indigo-200 dark:shadow-none font-black text-lg active:scale-95 transition-all text-white border-0">
                    <Plus className="w-6 h-6" />
                    <span>إضافة متجر جديد</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[80vw] sm:max-w-[80vw] w-full h-[70vh] max-h-[800px] flex flex-col p-0 gap-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl overflow-hidden rounded-2xl border-0 ring-1 ring-slate-200/50 dark:ring-slate-700/50 shadow-2xl transition-all duration-300 [&>button]:hidden text-right" dir="rtl">
                <form action={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    {/* Header */}
                    <DialogHeader className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between bg-gradient-to-l from-slate-50/50 via-white/50 to-slate-50/50 dark:from-slate-900/50 dark:via-slate-900/80 dark:to-slate-900/50 shrink-0 z-20">
                        <div className="flex flex-col gap-1 items-start">
                            <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                                    <Store className="w-6 h-6" />
                                </div>
                                إضافة متجر للنظام
                            </DialogTitle>
                            <p className="text-slate-500 font-medium text-sm">أدخل تفاصيل الفرع الجديد بدقة</p>
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

                    {/* Body - Scrollable */}
                    <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            {/* Store Name */}
                            <div className="space-y-4">
                                <Label htmlFor="name" className="text-slate-500 font-bold text-xs mr-1 uppercase tracking-widest">
                                    اسم المتجر / الفرع
                                </Label>
                                <div className="relative group">
                                    <Store className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                    <Input
                                        id="name"
                                        name="name"
                                        required
                                        placeholder="مثال: فرع كازابلانكا"
                                        className="h-14 pr-12 text-lg font-bold text-right border-0 bg-slate-50 dark:bg-slate-800/50 rounded-2xl shadow-inner focus-visible:ring-primary/20"
                                    />
                                </div>
                            </div>

                            {/* Store Location */}
                            <div className="space-y-4">
                                <Label htmlFor="location" className="text-slate-500 font-bold text-xs mr-1 uppercase tracking-widest">
                                    موقع المتجر
                                </Label>
                                <div className="relative group">
                                    <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                    <Input
                                        id="location"
                                        name="location"
                                        placeholder="مثال: شارع الحسن الثاني، الدار البيضاء"
                                        className="h-14 pr-12 text-lg font-bold text-right border-0 bg-slate-50 dark:bg-slate-800/50 rounded-2xl shadow-inner focus-visible:ring-primary/20"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Visual Help Text */}
                        <div className="p-6 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/20 rounded-2xl flex gap-4 items-start">
                            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                <Store className="w-5 h-5" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-black text-blue-900 dark:text-blue-300 text-sm">نصيحة تنظيمية</h4>
                                <p className="text-blue-700/70 dark:text-blue-400/60 text-xs leading-relaxed font-medium">
                                    تأكد من تسمية المتجر باسم يميزه عن الفروع الأخرى لتسهيل إدارة التقارير والمخزون لاحقاً.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer - Sticky */}
                    <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md flex flex-row items-center justify-end gap-3 shrink-0 z-20">
                        <Button type="button" variant="ghost" className="h-12 px-6 rounded-xl font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setOpen(false)}>
                            إلغاء العملية
                        </Button>
                        <Button type="submit" disabled={loading} className="h-12 px-8 rounded-xl bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 text-lg font-bold shadow-lg shadow-slate-900/10 text-white transition-all hover:scale-[1.02] active:scale-[0.98]">
                            {loading ? "جاري الحفظ..." : "تأكيد إضافة المتجر"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
