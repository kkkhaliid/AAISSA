import { createClient } from "@/utils/supabase/server";
import { StoreDialog } from "@/components/admin/store-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2 } from "lucide-react";
import { deleteStore } from "../actions";
import { ActionIconButton } from "@/components/admin/action-icon-button";

export default async function StoresPage() {
    const supabase = await createClient();
    const { data: stores } = await supabase.from("stores").select("*").order("created_at", { ascending: false });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">إدارة المتاجر</h1>
                <StoreDialog />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-right">اسم المتجر</TableHead>
                            <TableHead className="text-right">الموقع</TableHead>
                            <TableHead className="text-right">تاريخ الإضافة</TableHead>
                            <TableHead className="text-left w-[100px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {stores?.map((store) => (
                            <TableRow key={store.id}>
                                <TableCell className="font-medium">{store.name}</TableCell>
                                <TableCell>{store.location || "-"}</TableCell>
                                <TableCell>{new Date(store.created_at).toLocaleDateString("ar-MA")}</TableCell>
                                <TableCell>
                                    <ActionIconButton
                                        action={deleteStore}
                                        id={store.id}
                                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </ActionIconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {stores?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                                    لا توجد متاجر مضافة حالياً
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
