"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function undoSale(saleId: string, formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Unauthorized" };

    const { error } = await supabase.rpc("undo_sale", {
        p_sale_id: saleId,
        p_admin_id: user.id
    });

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/admin/sales");
    revalidatePath("/admin/dashboard");
    return { success: true };
}
