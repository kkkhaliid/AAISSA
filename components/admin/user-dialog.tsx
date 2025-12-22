"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Copy, UserCheck, Edit2 } from "lucide-react";
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

        if (result.error) {
            toast.error(result.error);
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
                    <Button className="gap-2 h-10 px-4 rounded-xl shadow-sm hover:shadow-md transition-all font-bold">
                        <Plus className="w-4 h-4" />
                        <span>Add New Worker</span>
                    </Button>
                </DialogTrigger>
            )}

            <DialogContent className="sm:max-w-md overflow-hidden p-0 gap-0 rounded-2xl">
                {!successData ? (
                    <>
                        <DialogHeader className="p-6 pb-2">
                            <DialogTitle className="text-xl font-bold">
                                {isEdit ? "Update Member Details" : "New Team Member"}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="p-6 pt-2">
                            <form action={handleSubmit} className="space-y-4">
                                {/* Hidden input to guarantee store_id is sent */}
                                <input type="hidden" name="store_id" value={selectedStore} />

                                <div className="space-y-2">
                                    <Label htmlFor="full_name" className="text-gray-600">Account Owner Name</Label>
                                    <Input
                                        id="full_name"
                                        name="full_name"
                                        required
                                        defaultValue={user?.full_name}
                                        placeholder="Enter worker's full name"
                                        className="h-11 rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-gray-600">Login Email Address</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        defaultValue={user?.email}
                                        placeholder="worker@aissaphone.com"
                                        className="h-11 rounded-xl"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="password" className="text-gray-600">
                                            {isEdit ? "Set New Password" : "Default Password"}
                                        </Label>
                                        <Input
                                            id="password"
                                            name="password"
                                            type="text"
                                            required={!isEdit}
                                            defaultValue={isEdit ? "" : "123456"}
                                            placeholder={isEdit ? "Leave blank to keep" : "Temporary pass"}
                                            className="h-11 font-mono bg-gray-50 rounded-xl"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-gray-600">Assign to Store</Label>
                                        <Select value={selectedStore} onValueChange={setSelectedStore} required>
                                            <SelectTrigger className="h-11 rounded-xl">
                                                <SelectValue placeholder="Select Branch..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {stores.map(store => (
                                                    <SelectItem key={store.id} value={store.id}>{store.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <Button type="submit" disabled={loading} className="w-full h-12 text-base font-bold rounded-xl shadow-lg shadow-primary/20">
                                        {loading ? "Processing..." : (isEdit ? "Save Updated Details" : "Activate Worker Account")}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center p-8 text-center bg-white animate-in zoom-in-95 duration-300">
                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                            <UserCheck className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Account Ready!</h2>
                        <p className="text-muted-foreground mt-1 mb-6 max-w-xs mx-auto">
                            Share these login details with the worker.
                        </p>

                        <div className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-left space-y-3 mb-6 relative group">
                            <div>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Name</span>
                                <div className="font-medium text-gray-900">{successData.name}</div>
                            </div>
                            <div className="h-px bg-gray-200 w-full" />
                            <div>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email</span>
                                <div className="font-mono text-gray-900 select-all">{successData.email}</div>
                            </div>
                            {successData.password && (
                                <div>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Password</span>
                                    <div className="font-mono text-lg font-bold text-primary select-all">{successData.password}</div>
                                </div>
                            )}

                            <Button
                                size="icon"
                                variant="ghost"
                                className="absolute top-2 right-2 hover:bg-white shadow-sm"
                                onClick={copyToClipboard}
                                title="Copy All"
                            >
                                <Copy className="w-4 h-4" />
                            </Button>
                        </div>

                        <Button onClick={handleClose} className="w-full h-12 font-bold rounded-xl">
                            Done
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

