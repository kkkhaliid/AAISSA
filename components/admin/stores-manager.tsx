"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2, Building2, MapPin, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ActionIconButton } from "@/components/admin/action-icon-button";
import { deleteStore, createStore, updateStore } from "@/app/admin/actions";
import { toast } from "sonner";

interface Store {
    id: string;
    name: string;
    location: string | null;
    created_at: string;
}

export function StoresManager({ stores }: { stores: Store[] }) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingStore, setEditingStore] = useState<Store | null>(null);

    const openAdd = () => {
        setEditingStore(null);
        setIsDialogOpen(true);
    };

    const openEdit = (store: Store) => {
        setEditingStore(store);
        setIsDialogOpen(true);
    };

    const handleSubmit = async (formData: FormData) => {
        try {
            if (editingStore) {
                await updateStore(editingStore.id, formData);
                toast.success("تم تحديث المتجر بنجاح");
            } else {
                await createStore(formData);
                toast.success("تم إضافة المتجر بنجاح");
            }
            setIsDialogOpen(false);
        } catch (error) {
            toast.error("حدث خطأ ما");
        }
    };

    return (
        <div className="space-y-10 max-w-7xl mx-auto" dir="rtl">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4 md:px-0">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">إدارة المتاجر</h1>
                    <p className="text-slate-500 font-medium mt-2">قم بإضافة وتعديل فروع متجرك</p>
                </div>
                <Button onClick={openAdd} className="gap-3 h-14 px-8 rounded-2xl gradient-primary shadow-xl shadow-indigo-200 dark:shadow-none font-black text-lg active:scale-95 transition-all text-white border-0">
                    <Plus className="w-6 h-6" />
                    <span>إضافة متجر جديد</span>
                </Button>
            </div>

            {/* Content - Modern Grid of Cards */}
            {/* Content - Modern Grid of Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 px-4 md:px-0">
                {stores.map((store) => (
                    <div key={store.id} className="group relative glass dark:glass-dark p-6 md:p-10 rounded-3xl md:rounded-[3.5rem] shadow-premium hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden border-0 ring-1 ring-white/20 dark:ring-white/5">
                        {/* Dynamic Gradient Background */}
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-[80px] group-hover:bg-primary/20 transition-all duration-700" />
                        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-violet-500/10 rounded-full blur-[80px] group-hover:bg-violet-500/20 transition-all duration-700" />

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-10">
                                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-[2rem] bg-gradient-to-br from-primary/10 to-indigo-500/5 dark:from-primary/20 dark:to-indigo-500/10 text-primary flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 ring-1 ring-primary/20">
                                    <Building2 className="w-8 h-8 md:w-10 md:h-10" />
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => openEdit(store)} className="h-12 w-12 text-slate-400 hover:text-primary hover:bg-white dark:hover:bg-slate-800 rounded-2xl shadow-sm transition-all border border-transparent hover:border-slate-100">
                                        <Edit2 className="w-5 h-5" />
                                    </Button>
                                    <ActionIconButton
                                        action={deleteStore}
                                        id={store.id}
                                        className="w-12 h-12 text-slate-400 hover:text-rose-600 hover:bg-white dark:hover:bg-slate-800 rounded-2xl shadow-sm transition-all border border-transparent hover:border-slate-100"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </ActionIconButton>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{store.name}</h3>
                                    <div className="flex items-center gap-3 mt-3">
                                        <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400">
                                            <MapPin className="w-4 h-4" />
                                        </div>
                                        <span className="text-slate-500 font-black text-xs uppercase tracking-widest">{store.location || "بدون عنوان محدد"}</span>
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex -space-x-2">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[8px] font-black text-slate-400">
                                                    SH
                                                </div>
                                            ))}
                                        </div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">موظفين نشطين</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-100 dark:border-emerald-500/20">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                        <span className="text-emerald-600 dark:text-emerald-400 font-black text-[10px] uppercase tracking-widest">نشط الآن</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {stores.length === 0 && (
                <div className="flex flex-col items-center justify-center py-32 text-slate-300">
                    <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] flex items-center justify-center mb-6">
                        <Building2 className="w-12 h-12" />
                    </div>
                    <p className="font-black text-2xl text-slate-900 dark:text-white">لا توجد متاجر مضافة بعد</p>
                    <p className="mt-2 font-medium">ابدأ بإضافة متجرك الأول لتنظيم المبيعات</p>
                </div>
            )}

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-[95vw] sm:max-w-[80vw] w-full h-[90vh] md:h-[70vh] max-h-[800px] flex flex-col p-0 gap-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl overflow-hidden rounded-3xl md:rounded-2xl border-0 ring-1 ring-slate-200/50 dark:ring-slate-700/50 shadow-2xl transition-all duration-300 [&>button]:hidden text-right" dir="rtl">
                    <form action={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                        {/* Header */}
                        <DialogHeader className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between bg-gradient-to-l from-slate-50/50 via-white/50 to-slate-50/50 dark:from-slate-900/50 dark:via-slate-900/80 dark:to-slate-900/50 shrink-0 z-20">
                            <div className="flex flex-col gap-1 items-start">
                                <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                                        <Building2 className="w-6 h-6" />
                                    </div>
                                    {editingStore ? "تعديل بيانات المتجر" : "إضافة فرع جديد"}
                                </DialogTitle>
                                <p className="text-slate-500 font-medium text-sm">أدخل تفاصيل المتجر بدقة لضمان دقة التقارير</p>
                            </div>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsDialogOpen(false)}
                                className="rounded-full w-10 h-10 bg-slate-100 dark:bg-slate-800 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </DialogHeader>

                        {/* Body - Scrollable */}
                        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 md:space-y-10 custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-4">
                                    <Label className="text-slate-500 font-bold text-xs mr-1 uppercase tracking-widest">اسم المتجر</Label>
                                    <div className="relative group">
                                        <Building2 className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-primary transition-colors" />
                                        <Input
                                            name="name"
                                            defaultValue={editingStore?.name}
                                            required
                                            className="h-14 text-lg font-bold text-right border-0 bg-slate-50 dark:bg-slate-800/50 rounded-2xl shadow-inner pr-12 focus-visible:ring-primary/20"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <Label className="text-slate-500 font-bold text-xs mr-1 uppercase tracking-widest">الموقع / العنوان</Label>
                                    <div className="relative group">
                                        <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-primary transition-colors pointer-events-none" />
                                        <Input
                                            name="location"
                                            defaultValue={editingStore?.location || ""}
                                            className="h-14 text-lg font-bold transition-all text-right border-0 bg-slate-50 dark:bg-slate-800/50 rounded-2xl shadow-inner pr-12 focus-visible:ring-primary/20"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Info Card */}
                            <div className="p-8 rounded-[2rem] bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/20 flex gap-6 items-center">
                                <div className="hidden sm:flex w-20 h-20 rounded-2xl bg-white dark:bg-slate-800 items-center justify-center shadow-sm text-primary shrink-0 ring-1 ring-indigo-100 dark:ring-indigo-900/30">
                                    <Building2 className="w-10 h-10" />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-black text-indigo-900 dark:text-indigo-300">إدارة الفروع</h4>
                                    <p className="text-indigo-700/70 dark:text-indigo-400/60 text-sm leading-relaxed font-medium">
                                        تغيير اسم المتجر أو موقعه سيؤثر على جميع التقارير المرتبطة بهذا الفرع. يرجى التأكد من صحة البيانات.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Footer - Sticky */}
                        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md flex flex-row items-center justify-end gap-3 shrink-0 z-20">
                            <Button type="button" variant="ghost" className="h-12 px-6 rounded-xl font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setIsDialogOpen(false)}>
                                إلغاء
                            </Button>
                            <Button type="submit" className="h-12 px-8 rounded-xl bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 text-lg font-bold shadow-lg shadow-slate-900/10 text-white transition-all hover:scale-[1.02] active:scale-[0.98]">
                                {editingStore ? "حفظ التغييرات" : "إضافة المتجر للنظام"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
