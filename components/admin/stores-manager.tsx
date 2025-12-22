"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2, Building2, MapPin } from "lucide-react";
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
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">إدارة المتاجر</h1>
                    <p className="text-slate-500 font-medium mt-2">قم بإضافة وتعديل فروع متجرك</p>
                </div>
                <Button onClick={openAdd} className="gap-3 h-14 px-8 rounded-2xl gradient-primary shadow-xl shadow-indigo-200 dark:shadow-none font-black text-lg active:scale-95 transition-all text-white border-0">
                    <Plus className="w-6 h-6" />
                    <span>إضافة متجر جديد</span>
                </Button>
            </div>

            {/* Content - Modern Grid of Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {stores.map((store) => (
                    <div key={store.id} className="glass dark:glass-dark p-8 rounded-[2.5rem] shadow-premium group hover:shadow-2xl hover:-translate-y-2 transition-all relative overflow-hidden bg-white dark:bg-slate-900">
                        {/* Background Accent */}
                        <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity" />

                        <div className="relative flex justify-between items-start mb-6">
                            <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-50 dark:bg-indigo-500/10 text-primary flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                <Building2 className="w-8 h-8" />
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="icon" onClick={() => openEdit(store)} className="h-10 w-10 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all">
                                    <Edit2 className="w-5 h-5" />
                                </Button>
                                <ActionIconButton
                                    action={deleteStore}
                                    id={store.id}
                                    className="w-10 h-10 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-all"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </ActionIconButton>
                            </div>
                        </div>

                        <div className="relative space-y-4">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white">{store.name}</h3>
                                <div className="flex items-center gap-2 mt-2 text-slate-500 font-medium">
                                    <MapPin className="w-4 h-4 text-primary/60" />
                                    <span>{store.location || "بدون عنوان"}</span>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-xl">
                                    متجر نشط
                                </div>
                                <div className="flex items-center gap-2 text-emerald-500 font-black text-sm">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    مفعل حالياً
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
                <DialogContent className="max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-0 shadow-2xl rounded-[3.5rem] p-0 overflow-hidden">
                    <form action={handleSubmit}>
                        <div className="p-10 space-y-10">
                            <DialogHeader>
                                <DialogTitle className="text-3xl font-black text-slate-900 dark:text-white text-right">
                                    {editingStore ? "تعديل المتجر" : "إضافة متجر جديد"}
                                </DialogTitle>
                                <p className="text-right text-slate-500 font-medium">أدخل تفاصيل المتجر بدقة</p>
                            </DialogHeader>

                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <Label className="text-right block font-black text-slate-400 uppercase tracking-widest text-[10px]">اسم المتجر</Label>
                                    <Input
                                        name="name"
                                        defaultValue={editingStore?.name}
                                        required
                                        className="h-14 text-lg font-bold text-right border-0 bg-slate-50 dark:bg-slate-800/50 rounded-2xl shadow-inner focus-visible:ring-primary/20"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-right block font-black text-slate-400 uppercase tracking-widest text-[10px]">الموقع / العنوان</Label>
                                    <div className="relative">
                                        <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
                                        <Input
                                            name="location"
                                            defaultValue={editingStore?.location || ""}
                                            className="h-14 text-lg font-bold transition-all text-right border-0 bg-slate-50 dark:bg-slate-800/50 rounded-2xl shadow-inner pr-12 focus-visible:ring-primary/20"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">
                                <Button size="lg" className="w-full h-18 rounded-3xl gradient-primary text-xl font-black shadow-xl border-0 text-white transition-all active:scale-[0.98]">
                                    {editingStore ? "حفظ التغييرات" : "إضافة المتجر"}
                                </Button>
                                <Button type="button" variant="ghost" className="w-full h-14 rounded-2xl font-black text-slate-400" onClick={() => setIsDialogOpen(false)}>
                                    إلغاء
                                </Button>
                            </div>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
