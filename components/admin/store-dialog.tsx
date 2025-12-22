"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { createStore } from "@/app/admin/actions";
import { toast } from "sonner";

export function StoreDialog() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        const result = await createStore(formData);
        setLoading(false);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("تم إضافة المتجر بنجاح");
            setOpen(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    إضافة متجر
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-right">إضافة متجر جديد</DialogTitle>
                </DialogHeader>
                <form action={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-right block">اسم المتجر</Label>
                        <Input id="name" name="name" required className="text-right" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="location" className="text-right block">الموقع</Label>
                        <Input id="location" name="location" className="text-right" />
                    </div>
                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? "جاري الحفظ..." : "حفظ"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
