"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createCustomer(formData: FormData) {
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const initial_debt = parseFloat(formData.get("debt") as string) || 0;

    const supabase = await createClient();
    const { error } = await supabase.from("customers").insert({
        name,
        phone,
        total_debt: initial_debt
    });

    if (error) return { error: error.message };
    revalidatePath("/worker/customers");
    return { success: true };
}

export async function updateDebt(customerId: string, amountToAdd: number) {
    const supabase = await createClient();

    // Fetch current
    const { data: customer } = await supabase.from("customers").select("total_debt").eq("id", customerId).single();
    if (!customer) return { error: "Customer not found" };

    const newDebt = (customer.total_debt || 0) + amountToAdd;

    const { error } = await supabase.from("customers").update({ total_debt: newDebt }).eq("id", customerId);

    if (error) return { error: error.message };
    revalidatePath("/worker/customers");
    return { success: true };
}
