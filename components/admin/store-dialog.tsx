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
            <DialogContent className="max-w-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-0 shadow-2xl rounded-[3.5rem] p-0 overflow-hidden" dir="rtl">
                <DialogHeader className="p-10 pb-0">
                    <DialogTitle className="text-3xl font-black text-slate-900 dark:text-white text-right">
                        إضافة متجر للنظام
                    </DialogTitle>
                </DialogHeader>

                <form action={handleSubmit} className="p-10 space-y-8">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-right block font-black text-slate-400 uppercase tracking-widest text-[10px]">
                                اسم المتجر
                            </Label>
                            <div className="relative">
                                <Store className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <Input
                                    id="name"
                                    name="name"
                                    required
                                    placeholder="مثال: فرع كازابلانكا"
                                    className="h-14 pr-12 text-lg font-bold text-right border-0 bg-slate-50 dark:bg-slate-800/50 rounded-2xl shadow-inner focus-visible:ring-primary/20"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="location" className="text-right block font-black text-slate-400 uppercase tracking-widest text-[10px]">
                                موقع المتجر
                            </Label>
                            <div className="relative">
                                <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <Input
                                    id="location"
                                    name="location"
                                    placeholder="مثال: شارع الحسن الثاني"
                                    className="h-14 pr-12 text-lg font-bold text-right border-0 bg-slate-50 dark:bg-slate-800/50 rounded-2xl shadow-inner focus-visible:ring-primary/20"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 pt-4">
                        <Button type="submit" disabled={loading} className="w-full h-20 rounded-3xl gradient-primary text-2xl font-black shadow-xl border-0 text-white transition-all active:scale-[0.98]">
                            {loading ? "جاري الحفظ..." : "تأكيد إضافة المتجر"}
                        </Button>
                        <Button type="button" variant="ghost" className="w-full h-14 rounded-2xl font-black text-slate-400" onClick={() => setOpen(false)}>
                            إلغاء العملية
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
