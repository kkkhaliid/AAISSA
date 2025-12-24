"use client";

import { useState } from "react";
import { UserDialog } from "@/components/admin/user-dialog";
import { Shield, Store, MoreVertical, Trash2, Edit, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { deleteWorker } from "@/app/admin/actions";

type Store = { id: string; name: string };
type Profile = {
    id: string;
    full_name: string;
    email?: string;
    role: string;
    store_id: string;
    created_at: string;
    stores?: { name: string } | null;
};

export function UsersManager({ initialUsers, stores }: { initialUsers: Profile[], stores: Store[] }) {
    const [users, setUsers] = useState<Profile[]>(initialUsers);
    const [editingUser, setEditingUser] = useState<Profile | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    function handleUserCreated(newUser: any) {
        const storeName = stores.find(s => s.id === newUser.store_id)?.name || "Unassigned";
        const userWithStore = {
            ...newUser,
            stores: { name: storeName }
        };
        setUsers([userWithStore, ...users]);
    }

    function handleUserUpdated(updatedUser: any) {
        const storeName = stores.find(s => s.id === updatedUser.store_id)?.name || "Unassigned";
        setUsers(users.map(u => u.id === updatedUser.id ? { ...u, ...updatedUser, stores: { name: storeName } } : u));
        setEditingUser(null);
        setIsEditDialogOpen(false);
    }

    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to remove this worker? This action cannot be undone.")) return;

        const result = await deleteWorker(id);
        if (result.success) {
            setUsers(users.filter(u => u.id !== id));
            toast.success("Worker removed successfully");
        } else {
            toast.error(result.error || "Failed to delete worker");
        }
    }

    function openEdit(user: Profile) {
        setEditingUser(user);
        setIsEditDialogOpen(true);
    }

    return (
        <div className="space-y-10 max-w-7xl mx-auto" dir="rtl">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4 md:px-0">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">إدارة الفريق</h1>
                    <p className="text-slate-500 font-medium mt-2">تحكم في صلاحيات الوصول للموظفين والمسؤولين</p>
                </div>
                <UserDialog stores={stores} onSuccess={handleUserCreated} />
            </div>

            {/* Edit Dialog (Reused UserDialog component) */}
            {editingUser && (
                <UserDialog
                    stores={stores}
                    user={editingUser}
                    open={isEditDialogOpen}
                    onOpenChange={setIsEditDialogOpen}
                    onSuccess={handleUserUpdated}
                />
            )}

            {/* Users List - Floating Card Rows */}
            <div className="space-y-4">
                {/* Custom Card Header - Only visible on desktop */}
                <div className="grid grid-cols-5 px-10 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 hidden md:grid">
                    <div className="pr-4">عضو الفريق</div>
                    <div>الصلاحية</div>
                    <div>المتجر المعين</div>
                    <div>تاريخ الانضمام</div>
                    <div className="text-left">الإجراءات</div>
                </div>

                {users.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-slate-300">
                        <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] flex items-center justify-center mb-6">
                            <UserCircle className="w-12 h-12" />
                        </div>
                        <p className="font-black text-2xl text-slate-900 dark:text-white">لا يوجد أعضاء في الفريق حالياً</p>
                        <p className="mt-2 font-medium">ابدأ بإضافة موظفيك لتنظيم العمل</p>
                    </div>
                ) : (
                    <div className="space-y-4 px-4 md:px-0">
                        {users.map((profile) => (
                            <div
                                key={profile.id}
                                className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center bg-white dark:bg-slate-900 p-5 md:p-5 md:px-10 rounded-3xl md:rounded-[2.5rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ring-1 ring-black/5 dark:ring-white/5 group active:scale-[0.99]"
                            >
                                {/* User Profile Info */}
                                <div className="flex items-center gap-5">
                                    <div className={cn(
                                        "w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-lg shrink-0 font-black text-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3",
                                        profile.role === 'admin'
                                            ? "bg-indigo-500 text-white shadow-indigo-500/20"
                                            : "bg-emerald-500 text-white shadow-emerald-500/20"
                                    )}>
                                        {getInitials(profile.full_name)}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="font-black text-slate-900 dark:text-white text-xl tracking-tight truncate">{profile.full_name || "بدون اسم"}</div>
                                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 truncate">
                                            {profile.email || "بدون بريد إلكتروني"}
                                        </div>
                                    </div>
                                </div>

                                {/* Role Indicator */}
                                <div>
                                    <div className={cn(
                                        "inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest",
                                        profile.role === 'admin'
                                            ? "bg-indigo-500/10 text-indigo-500 ring-1 ring-indigo-500/20"
                                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 ring-1 ring-black/5 dark:ring-white/5"
                                    )}>
                                        {profile.role === 'admin' && <Shield className="w-3.5 h-3.5" />}
                                        <span>{profile.role === 'admin' ? "مسؤول" : "موظف"}</span>
                                    </div>
                                </div>

                                {/* Store Name */}
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center ring-1 ring-black/5 dark:ring-white/5">
                                        <Store className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <span className="font-bold text-slate-700 dark:text-slate-300">
                                        {/* @ts-ignore */}
                                        {profile.stores?.name || "جميع المتاجر"}
                                    </span>
                                </div>

                                {/* Created Date */}
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    <span suppressHydrationWarning>
                                        {new Date(profile.created_at).toLocaleDateString("ar-MA", {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </span>
                                </div>

                                {/* Actions */}
                                <div className="flex justify-end items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => openEdit(profile)}
                                        className="h-12 w-12 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-slate-400 hover:text-primary"
                                    >
                                        <Edit className="w-5 h-5" />
                                    </Button>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-slate-400">
                                                <MoreVertical className="w-5 h-5" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="start" className="rounded-2xl border-0 shadow-2xl p-2 min-w-[180px] ring-1 ring-black/5">
                                            <DropdownMenuItem
                                                onClick={() => handleDelete(profile.id)}
                                                className="text-rose-600 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/30 rounded-xl h-12 gap-3 font-bold cursor-pointer"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                                <span>حذف الحساب</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function getInitials(name: string) {
    if (!name) return "?";
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
}
