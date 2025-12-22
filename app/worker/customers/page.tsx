import { createClient } from "@/utils/supabase/server";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { createCustomer } from "./actions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default async function CustomersPage() {
    const supabase = await createClient();
    const { data: customers } = await supabase.from("customers").select("*").order("name");

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">الزبائن والديون</h1>

                <Dialog>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="w-4 h-4" />
                            إضافة زبون
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="text-right">إضافة زبون جديد</DialogTitle>
                        </DialogHeader>
                        <form action={async (formData) => {
                            "use server";
                            await createCustomer(formData);
                        }} className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-right block">اسم الزبون</Label>
                                <Input name="name" required className="text-right" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-right block">الهاتف</Label>
                                <Input name="phone" className="text-right" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-right block">الدين الأولي</Label>
                                <Input name="debt" type="number" defaultValue="0" className="text-right" />
                            </div>
                            <Button type="submit" className="w-full">حفظ</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-right">الاسم</TableHead>
                            <TableHead className="text-right">الهاتف</TableHead>
                            <TableHead className="text-right">مجموع الديون</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {customers?.map((c) => (
                            <TableRow key={c.id}>
                                <TableCell className="font-medium">{c.name}</TableCell>
                                <TableCell>{c.phone || "-"}</TableCell>
                                <TableCell className={c.total_debt > 0 ? "text-red-500 font-bold" : "text-green-600"}>
                                    {c.total_debt} MAD
                                </TableCell>
                            </TableRow>
                        ))}
                        {customers?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                                    لا يوجد زبائن
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
