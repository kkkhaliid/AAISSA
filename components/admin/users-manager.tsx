"use client";

import { useState } from "react";
import { UserDialog } from "@/components/admin/user-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Shield, Store, MoreVertical, Trash2, Edit, Mail } from "lucide-react";
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
        <div className="space-y-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Team Management</h1>
                    <p className="text-muted-foreground">Manage access and roles for your employees</p>
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

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-50/50">
                        <TableRow className="border-gray-100 hover:bg-transparent">
                            <TableHead className="h-12 font-bold text-gray-600 w-[300px]">Team Member</TableHead>
                            <TableHead className="font-bold text-gray-600">Access Role</TableHead>
                            <TableHead className="font-bold text-gray-600">Assigned Store</TableHead>
                            <TableHead className="font-bold text-gray-600">Join Date</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((profile) => (
                            <TableRow key={profile.id} className="border-gray-100 hover:bg-gray-50/50 transition-colors h-16 group">
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center border shrink-0",
                                            profile.role === 'admin'
                                                ? "bg-purple-50 text-purple-600 border-purple-100"
                                                : "bg-blue-50 text-blue-600 border-blue-100"
                                        )}>
                                            <span className="font-bold text-xs">
                                                {getInitials(profile.full_name)}
                                            </span>
                                        </div>
                                        <div className="min-w-0">
                                            <div className="font-bold text-gray-900 truncate">{profile.full_name || "Unknown Name"}</div>
                                            <div className="text-[11px] text-muted-foreground flex items-center gap-1 truncate uppercase tracking-tighter">
                                                <Mail className="w-3 h-3" />
                                                {profile.email || "No email"}
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={cn(
                                        "rounded-full px-2 py-0 text-[10px] uppercase font-bold border-none",
                                        profile.role === 'admin' ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                                    )}>
                                        {profile.role === 'admin' ? 'Admin' : 'Worker'}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                                        <Store className="w-3.5 h-3.5 text-gray-400" />
                                        <span className="font-medium">
                                            {/* @ts-ignore */}
                                            {profile.stores?.name || "Global / All Stores"}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="font-mono text-[11px] text-muted-foreground">
                                    <span suppressHydrationWarning>
                                        {new Date(profile.created_at).toLocaleDateString("en-GB", {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <MoreVertical className="w-4 h-4 text-gray-400" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="rounded-xl">
                                            <DropdownMenuItem onClick={() => openEdit(profile)} className="rounded-lg">
                                                <Edit className="w-4 h-4 mr-2" />
                                                Edit Access
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleDelete(profile.id)} className="text-red-600 focus:text-red-600 focus:bg-red-50 rounded-lg">
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Remove Profile
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                        {users.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                                    No team members found. Click "Add New Worker" to start.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

function getInitials(name: string) {
    if (!name) return "?";
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
}

