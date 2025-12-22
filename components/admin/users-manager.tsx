"use client";

import { useState } from "react";
import { UserDialog } from "@/components/admin/user-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Shield, Store, MoreVertical, Trash2, Edit, Mail, UserCircle } from "lucide-react";
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
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">إدارة الفريق</h1>
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

            <div className="glass dark:glass-dark rounded-[2.5rem] shadow-premium overflow-hidden border-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-slate-100 dark:border-white/5 hover:bg-transparent h-20">
                                <TableHead className="text-right font-black text-slate-400 uppercase tracking-widest text-[10px] pr-8">عضو الفريق</TableHead>
                                <TableHead className="text-right font-black text-slate-400 uppercase tracking-widest text-[10px]">الصلاحية</TableHead>
                                <TableHead className="text-right font-black text-slate-400 uppercase tracking-widest text-[10px]">المتجر المعين</TableHead>
                                <TableHead className="text-right font-black text-slate-400 uppercase tracking-widest text-[10px]">تاريخ الانضمام</TableHead>
                                <TableHead className="w-[80px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((profile) => (
                                <TableRow key={profile.id} className="border-slate-100 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors h-24 group">
                                    <TableCell className="pr-8">
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm shrink-0 font-black text-lg transition-transform group-hover:scale-110",
                                                profile.role === 'admin'
                                                    ? "bg-indigo-50 dark:bg-indigo-500/10 text-primary"
                                                    : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600"
                                            )}>
                                                {getInitials(profile.full_name)}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-black text-slate-900 dark:text-white text-lg truncate">{profile.full_name || "بدون اسم"}</div>
                                                <div className="text-xs text-slate-500 font-medium flex items-center gap-2 mt-1">
                                                    <Mail className="w-3.5 h-3.5 text-slate-300" />
                                                    {profile.email || "بدون بريد"}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className={cn(
                                            "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                                            profile.role === 'admin'
                                                ? "bg-indigo-500 text-white shadow-lg shadow-indigo-200 dark:shadow-none"
                                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                                        )}>
                                            {profile.role === 'admin' ? (
                                                <>
                                                    <Shield className="w-3 h-3" />
                                                    <span>مسؤول</span>
                                                </>
                                            ) : (
                                                <span>موظف</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3 text-slate-900 dark:text-white font-bold">
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                <Store className="w-4 h-4 text-slate-400" />
                                            </div>
                                            <span>
                                                {/* @ts-ignore */}
                                                {profile.stores?.name || "جميع المتاجر"}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-black text-slate-400 text-xs">
                                        <span suppressHydrationWarning>
                                            {new Date(profile.created_at).toLocaleDateString("ar-MA", {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </TableCell>
                                    <TableCell className="pl-8">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all opacity-0 group-hover:opacity-100">
                                                    <MoreVertical className="w-6 h-6 text-slate-400" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="rounded-2xl border-0 shadow-2xl p-2 min-w-[160px]">
                                                <DropdownMenuItem onClick={() => openEdit(profile)} className="rounded-xl h-12 gap-3 font-bold cursor-pointer">
                                                    <Edit className="w-5 h-5 text-slate-400" />
                                                    <span>تعديل الصلاحيات</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDelete(profile.id)} className="text-rose-600 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/30 rounded-xl h-12 gap-3 font-bold cursor-pointer mt-1">
                                                    <Trash2 className="w-5 h-5" />
                                                    <span>حذف الحساب</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {users.length === 0 && (
                <div className="flex flex-col items-center justify-center py-32 text-slate-300">
                    <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] flex items-center justify-center mb-6">
                        <UserCircle className="w-12 h-12" />
                    </div>
                    <p className="font-black text-2xl text-slate-900 dark:text-white">لا يوجد أعضاء في الفريق حالياً</p>
                    <p className="mt-2 font-medium">ابدأ بإضافة موظفيك لتنظيم العمل</p>
                </div>
            )}
        </div>
    );
}

function getInitials(name: string) {
    if (!name) return "?";
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
}

