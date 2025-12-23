"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Copy, UserCheck, Edit2, X } from "lucide-react";
import { createWorker, updateWorker } from "@/app/admin/actions";
import { toast } from "sonner";

type Store = { id: string; name: string };
type User = { id: string; full_name: string; email?: string; store_id: string };

interface UserDialogProps {
    stores: Store[];
    onSuccess?: (user: any) => void;
    user?: User | null;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function UserDialog({ stores, onSuccess, user, open: externalOpen, onOpenChange: setExternalOpen }: UserDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const open = externalOpen !== undefined ? externalOpen : internalOpen;
    const setOpen = setExternalOpen || setInternalOpen;

    const [loading, setLoading] = useState(false);
    const [successData, setSuccessData] = useState<{ name: string, email: string, password?: string } | null>(null);
    const [selectedStore, setSelectedStore] = useState<string>(user?.store_id || "");

    const isEdit = !!user;

    // Sync selected store when user changes
    useEffect(() => {
        if (user) {
            setSelectedStore(user.store_id);
        } else if (open) {
            setSelectedStore("");
        }
    }, [user, open]);

    async function handleSubmit(formData: FormData) {
        // Manually ensure store_id is captured from state
        formData.set("store_id", selectedStore);

        setLoading(true);
        let result;

        if (isEdit && user) {
            result = await updateWorker(user.id, formData);
        } else {
            result = await createWorker(formData);
        }

        setLoading(false);

        if (result && 'error' in result) {
            toast.error(result.error as string);
        } else {
            if (!isEdit) {
                setSuccessData({
                    name: formData.get("full_name") as string,
                    email: formData.get("email") as string,
                    password: formData.get("password") as string,
                });
                toast.success("Worker created successfully");
            } else {
                toast.success("Worker updated successfully");
                handleClose();
            }

            if (onSuccess) {
                const updatedUser = isEdit
                    ? { ...user, full_name: formData.get("full_name"), email: formData.get("email"), store_id: selectedStore }
                    : (result as any).user;
                onSuccess(updatedUser);
            }
        }
    }

    function handleClose() {
        setOpen(false);
        setTimeout(() => setSuccessData(null), 300);
    }

    function copyToClipboard() {
        if (!successData) return;
        const text = `AissaPhone Login:\nEmail: ${successData.email}\nPassword: ${successData.password}`;
        navigator.clipboard.writeText(text);
        toast.success("Credentials copied to clipboard");
    }

    return (
        <Dialog open={open} onOpenChange={(val) => {
            if (!val) handleClose();
            else setOpen(true);
        }}>
            {!isEdit && (
                <DialogTrigger asChild>
                    <Button className="gap-3 h-14 px-8 rounded-2xl gradient-primary shadow-xl shadow-indigo-200 dark:shadow-none font-black text-lg active:scale-95 transition-all text-white border-0">
                        <Plus className="w-6 h-6" />
                        <span>إضافة عضو جديد</span>
                    </Button>
                </DialogTrigger>
            )}

            <DialogContent className="max-w-[80vw] sm:max-w-[80vw] w-full h-[70vh] max-h-[800px] flex flex-col p-0 gap-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl overflow-hidden rounded-2xl border-0 ring-1 ring-slate-200/50 dark:ring-slate-700/50 shadow-2xl transition-all duration-300 [&>button]:hidden text-right" dir="rtl">
                {!successData ? (
                    <form action={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                        {/* Header */}
                        <DialogHeader className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between bg-gradient-to-l from-slate-50/50 via-white/50 to-slate-50/50 dark:from-slate-900/50 dark:via-slate-900/80 dark:to-slate-900/50 shrink-0 z-20">
                            <div className="flex flex-col gap-1 items-start">
                                <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                                        <Plus className="w-6 h-6" />
                                    </div>
                                    {isEdit ? "تعديل بيانات العضو" : "إضافة عضو فريق جديد"}
                                </DialogTitle>
                                <p className="text-slate-500 font-medium text-sm">قم بتعبئة بيانات الدخول والتعيين للموظف</p>
                            </div>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleClose}
                                className="rounded-full w-10 h-10 bg-slate-100 dark:bg-slate-800 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </DialogHeader>

                        {/* Body - Scrollable */}
                        <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                {/* Basic Info */}
                                <div className="space-y-6">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">البيانات الأساسية</h3>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-slate-500 font-bold text-xs mr-1">الاسم الكامل</Label>
                                            <Input
                                                id="full_name"
                                                name="full_name"
                                                required
                                                defaultValue={user?.full_name}
                                                placeholder="مثال: يوسف العلوي"
                                                className="h-14 text-lg font-bold text-right border-0 bg-slate-50 dark:bg-slate-800/50 rounded-2xl shadow-inner focus-visible:ring-primary/20"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-slate-500 font-bold text-xs mr-1">البريد الإلكتروني</Label>
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                required
                                                defaultValue={user?.email}
                                                placeholder="worker@aissaphone.com"
                                                className="h-14 text-lg font-bold text-left border-0 bg-slate-50 dark:bg-slate-800/50 rounded-2xl shadow-inner focus-visible:ring-primary/20"
                                                dir="ltr"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Security & Assignment */}
                                <div className="space-y-6">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">الأمان والتعيين</h3>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-slate-500 font-bold text-xs mr-1">كلمة المرور</Label>
                                            <Input
                                                id="password"
                                                name="password"
                                                type="text"
                                                required={!isEdit}
                                                defaultValue={isEdit ? "" : "123456"}
                                                placeholder={isEdit ? "اتركه فارغاً للحفظ" : "كلمة سر مؤقتة"}
                                                className="h-14 font-mono font-black text-center border-0 bg-slate-50 dark:bg-slate-800/50 rounded-2xl shadow-inner focus-visible:ring-primary/20 text-primary"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-slate-500 font-bold text-xs mr-1">المتجر المعين</Label>
                                            <Select value={selectedStore} onValueChange={setSelectedStore} required>
                                                <SelectTrigger className="h-14 rounded-2xl border-0 bg-slate-50 dark:bg-slate-800/50 shadow-inner font-bold text-right">
                                                    <SelectValue placeholder="اختر الفرع..." />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl border-slate-100 dark:border-slate-800 shadow-2xl">
                                                    {stores.map(store => (
                                                        <SelectItem key={store.id} value={store.id} className="rounded-xl font-bold">{store.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer - Sticky */}
                        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md flex flex-row items-center justify-end gap-3 shrink-0 z-20">
                            <Button type="button" variant="ghost" className="h-12 px-6 rounded-xl font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={handleClose}>
                                إلغاء
                            </Button>
                            <Button type="submit" disabled={loading} className="h-12 px-8 rounded-xl bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 text-lg font-bold shadow-lg shadow-slate-900/10 text-white transition-all hover:scale-[1.02] active:scale-[0.98]">
                                {loading ? "جاري المعالجة..." : (isEdit ? "حفظ التغييرات" : "تفعيل الحساب")}
                            </Button>
                        </div>
                    </form>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-10 text-center animate-in zoom-in-95 duration-500 overflow-y-auto">
                        <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 rounded-[2.5rem] flex items-center justify-center mb-8 mx-auto shadow-sm ring-1 ring-emerald-500/20">
                            <UserCheck className="w-12 h-12" />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">الحساب جاهز!</h2>
                        <p className="text-slate-500 font-medium mb-10 max-w-[320px] mx-auto leading-relaxed">
                            تم إنشاء حساب الموظف بنجاح. شارك بيانات الدخول التالية معه:
                        </p>

                        <div className="w-full max-w-lg bg-slate-50 dark:bg-slate-800/10 border border-slate-100 dark:border-white/5 rounded-[2.5rem] p-10 text-right space-y-8 mb-10 relative group shadow-inner">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">الاسم الكامل</span>
                                    <div className="text-xl font-black text-slate-900 dark:text-white">{successData.name}</div>
                                </div>
                                <div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">البريد الإلكتروني</span>
                                    <div className="text-lg font-mono font-bold text-slate-700 dark:text-slate-300 select-all">{successData.email}</div>
                                </div>
                            </div>

                            {successData.password && (
                                <>
                                    <div className="h-px bg-slate-200 dark:bg-white/5" />
                                    <div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">كلمة المرور المؤقتة</span>
                                        <div className="text-4xl font-mono font-black text-primary select-all tracking-widest">{successData.password}</div>
                                    </div>
                                </>
                            )}

                            <Button
                                size="icon"
                                variant="ghost"
                                className="absolute top-6 left-6 w-12 h-12 rounded-2xl hover:bg-white dark:hover:bg-slate-800 shadow-sm transition-all active:scale-95 border border-slate-100 dark:border-white/5"
                                onClick={copyToClipboard}
                            >
                                <Copy className="w-5 h-5 text-slate-400" />
                            </Button>
                        </div>

                        <Button onClick={handleClose} className="min-w-[200px] h-14 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xl font-black shadow-xl border-0 transition-all active:scale-[0.98]">
                            تم، إغلاق النافذة
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

