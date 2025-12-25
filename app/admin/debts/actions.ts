"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export type DebtStatus = 'upcoming' | 'overdue' | 'paid';

export type Debt = {
    id: string;
    customer_name: string;
    phone_number: string;
    template_id: string | null;
    total_amount: number;
    paid_amount: number;
    due_date: string;
    notes: string | null;
    status: DebtStatus;
    created_at: string;
    product_templates?: {
        name: string;
    } | null;
};

export async function getDebts() {
    const supabase = await createClient();

    // Auto-update overdue status before fetching
    const today = new Date().toISOString().split('T')[0];
    await supabase
        .from("debts")
        .update({ status: 'overdue' })
        .lt("due_date", today)
        .neq("status", 'paid');

    const { data, error } = await supabase
        .from("debts")
        .select(`
            *,
            product_templates (
                name
            )
        `)
        .order("due_date", { ascending: true });

    if (error) throw error;
    return data as Debt[];
}

export async function createDebt(formData: FormData) {
    const supabase = await createClient();

    const customer_name = formData.get("customer_name") as string;
    const phone_number = formData.get("phone_number") as string;
    const template_id = formData.get("template_id") as string || null;
    const total_amount = parseFloat(formData.get("total_amount") as string) || 0;
    const paid_amount = parseFloat(formData.get("paid_amount") as string) || 0;
    const due_date = formData.get("due_date") as string;
    const notes = formData.get("notes") as string || null;

    // Initial status check
    const today = new Date().toISOString().split('T')[0];
    let status: DebtStatus = 'upcoming';
    if (paid_amount >= total_amount) {
        status = 'paid';
    } else if (due_date < today) {
        status = 'overdue';
    }

    const { error } = await supabase
        .from("debts")
        .insert({
            customer_name,
            phone_number,
            template_id,
            total_amount,
            paid_amount,
            due_date,
            notes,
            status
        });

    if (error) return { error: error.message };

    revalidatePath("/admin/debts");
    revalidatePath("/admin/dashboard");
    return { success: true };
}

export async function updateDebtPayment(id: string, paid_amount: number) {
    const supabase = await createClient();

    const { data: debt, error: fetchError } = await supabase
        .from("debts")
        .select("*")
        .eq("id", id)
        .single();

    if (fetchError) return { error: fetchError.message };

    const total_paid = (debt.paid_amount || 0) + paid_amount;
    let status = debt.status;

    if (total_paid >= debt.total_amount) {
        status = 'paid';
    }

    const { error } = await supabase
        .from("debts")
        .update({
            paid_amount: total_paid,
            status
        })
        .eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/admin/debts");
    revalidatePath("/admin/dashboard");
    return { success: true };
}

export async function deleteDebt(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from("debts").delete().eq("id", id);
    if (error) return { error: error.message };

    revalidatePath("/admin/debts");
    revalidatePath("/admin/dashboard");
    return { success: true };
}

export async function getOverdueCount() {
    const supabase = await createClient();
    const today = new Date().toISOString().split('T')[0];

    const { count, error } = await supabase
        .from("debts")
        .select("*", { count: 'exact', head: true })
        .or(`status.eq.overdue,and(due_date.lt.${today},status.neq.paid)`);

    if (error) return 0;
    return count || 0;
}
