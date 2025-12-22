"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";

// --- STORES ---

export async function createStore(formData: FormData) {
    const supabase = await createClient();
    const name = formData.get("name") as string;
    const location = formData.get("location") as string;

    const { error } = await supabase.from("stores").insert({ name, location });
    if (error) return { error: error.message };
    revalidatePath("/admin/stores");
    return { success: true };
}

export async function updateStore(id: string, formData: FormData) {
    const supabase = await createClient();
    const name = formData.get("name") as string;
    const location = formData.get("location") as string;

    const { error } = await supabase.from("stores").update({ name, location }).eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/admin/stores");
    return { success: true };
}

export async function deleteStore(id: string, formData: FormData) {
    const supabase = await createClient();
    const { error } = await supabase.from("stores").delete().eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/admin/stores");
    return { success: true };
}

// --- PRODUCTS & CATALOG ---

export async function createProduct(formData: FormData) {
    const name = formData.get("name") as string;
    const barcode = formData.get("barcode") as string || null;
    const stock = parseInt(formData.get("stock") as string) || 0;
    const buy_price = parseFloat(formData.get("buy_price") as string) || 0;
    const min_sell_price = parseFloat(formData.get("min_sell_price") as string) || 0;
    const max_sell_price = parseFloat(formData.get("max_sell_price") as string) || 0;
    const imageFile = formData.get("image") as File;
    const storeIds = formData.getAll("store_ids") as string[];

    const supabase = await createClient();

    // 1. Handle Image Upload
    let image_url = null;
    if (imageFile && imageFile.size > 0) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `products/${fileName}`;
        const { error: uploadError } = await supabase.storage.from("product-images").upload(filePath, imageFile);
        if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(filePath);
            image_url = publicUrl;
        }
    }

    // 2. Ensure Template exists (by barcode or name)
    let templateId: string;
    let query = supabase.from("product_templates").select("id");

    if (barcode) {
        query = query.eq("barcode", barcode);
    } else {
        query = query.eq("name", name);
    }

    const { data: existingTemplate } = await query.maybeSingle();

    if (existingTemplate) {
        templateId = existingTemplate.id;
        // Update template details if updated
        const updateData: any = { name };
        if (barcode) updateData.barcode = barcode;
        if (image_url) updateData.image_url = image_url;
        await supabase.from("product_templates").update(updateData).eq("id", templateId);
    } else {
        const { data: newTemplate, error: tError } = await supabase
            .from("product_templates")
            .insert({ name, barcode: barcode || null, image_url })
            .select("id")
            .single();
        if (tError) return { error: tError.message };
        templateId = newTemplate.id;
    }

    // 3. Create Inventory Rows for selected stores
    const inventoryRows = storeIds.map(sid => ({
        template_id: templateId,
        store_id: sid,
        stock,
        buy_price,
        min_sell_price,
        max_sell_price
    }));

    const { error: pError } = await supabase.from("products").upsert(inventoryRows, {
        onConflict: 'template_id,store_id'
    });

    if (pError) return { error: pError.message };
    revalidatePath("/admin/products");
    return { success: true };
}

export async function updateProduct(id: string, formData: FormData) {
    const name = formData.get("name") as string;
    const barcode = formData.get("barcode") as string || null;
    const stock = parseInt(formData.get("stock") as string) || 0;
    const buy_price = parseFloat(formData.get("buy_price") as string) || 0;
    const min_sell_price = parseFloat(formData.get("min_sell_price") as string) || 0;
    const max_sell_price = parseFloat(formData.get("max_sell_price") as string) || 0;
    const imageFile = formData.get("image") as File;
    const storeIds = formData.getAll("store_ids") as string[];

    const supabase = await createClient();

    // 1. Get current product to find template
    const { data: currentProduct } = await supabase.from("products").select("template_id").eq("id", id).single();
    if (!currentProduct) return { error: "Product not found" };

    // 2. Update Template
    const templateUpdate: any = { name, barcode: barcode || null };
    if (imageFile && imageFile.size > 0) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `products/${fileName}`;
        const { error: uploadError } = await supabase.storage.from("product-images").upload(filePath, imageFile);
        if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(filePath);
            templateUpdate.image_url = publicUrl;
        }
    }
    await supabase.from("product_templates").update(templateUpdate).eq("id", currentProduct.template_id);

    // 3. Sync Inventory Rows
    if (storeIds.length > 0) {
        const inventoryRows = storeIds.map(sid => ({
            template_id: currentProduct.template_id,
            store_id: sid,
            stock,
            buy_price,
            min_sell_price,
            max_sell_price
        }));

        const { error: syncError } = await supabase.from("products").upsert(inventoryRows, {
            onConflict: 'template_id,store_id'
        });
        if (syncError) return { error: syncError.message };
    } else {
        // Just update the current one if no multiple selection
        const { error } = await supabase.from("products").update({
            stock,
            buy_price,
            min_sell_price,
            max_sell_price
        }).eq("id", id);
        if (error) return { error: error.message };
    }

    revalidatePath("/admin/products");
    return { success: true };
}

export async function deleteProduct(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/admin/products");
    return { success: true };
}

export async function importProducts(data: any[]) {
    const supabase = await createClient();
    try {
        for (const item of data) {
            // 1. Upsert Template
            const { data: template, error: tError } = await supabase
                .from("product_templates")
                .upsert({
                    name: item.name,
                    barcode: item.barcode,
                    image_url: item.image_url
                }, { onConflict: 'barcode' })
                .select("id")
                .single();

            if (tError) continue;

            // 2. Upsert Inventory
            if (item.inventory && Array.isArray(item.inventory)) {
                const rows = item.inventory.map((inv: any) => ({
                    template_id: template.id,
                    store_id: inv.store_id,
                    stock: inv.stock,
                    buy_price: inv.buy_price,
                    min_sell_price: inv.min_sell_price,
                    max_sell_price: inv.max_sell_price
                }));
                await supabase.from("products").upsert(rows, { onConflict: 'template_id,store_id' });
            }
        }
    } catch (err: any) {
        return { success: false, error: err.message };
    }

    revalidatePath("/admin/products");
    return { success: true };
}

// --- USERS ---

export async function createWorker(formData: FormData) {
    try {
        const full_name = formData.get("full_name")?.toString().trim();
        const email = formData.get("email")?.toString().trim();
        const password = formData.get("password")?.toString();
        const store_id = formData.get("store_id")?.toString();

        if (!full_name || !email || !password) {
            return { error: "Name, email and password are required" };
        }

        const supabaseAdmin = createAdminClient();

        // 1. Create Auth User
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name }
        });

        if (authError) return { error: authError.message };
        if (!authData.user) return { error: "Failed to create authentication account" };

        // 2. Create/Update Profile (Using upsert to be safe)
        const profileData = {
            id: authData.user.id,
            full_name: full_name,
            email: email,
            role: "worker",
            store_id: store_id || null,
            created_at: new Date().toISOString()
        };

        const { error: profileError } = await supabaseAdmin
            .from("profiles")
            .upsert(profileData);

        if (profileError) {
            return { error: "Account created but profile setup failed: " + profileError.message };
        }

        revalidatePath("/admin/users");
        return { success: true, user: profileData };
    } catch (e: any) {
        return { error: e.message || "An unexpected error occurred" };
    }
}

export async function updateWorker(userId: string, formData: FormData) {
    try {
        const full_name = formData.get("full_name")?.toString().trim();
        const email = formData.get("email")?.toString().trim();
        const password = formData.get("password")?.toString();
        const store_id = formData.get("store_id")?.toString();

        if (!full_name || !email) {
            return { error: "Name and email are required" };
        }

        const supabaseAdmin = createAdminClient();

        // 1. Update Auth
        const authUpdates: any = { email };
        if (password && password.length >= 6) {
            authUpdates.password = password;
        }

        const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, authUpdates);
        if (authError) return { error: "Authentication update failed: " + authError.message };

        // 2. Update Profile
        const { error: profileError } = await supabaseAdmin
            .from("profiles")
            .update({
                full_name: full_name,
                email: email,
                store_id: store_id || null
            })
            .eq("id", userId);

        if (profileError) return { error: "Profile update failed: " + profileError.message };

        revalidatePath("/admin/users");
        return { success: true };
    } catch (e: any) {
        return { error: e.message || "An unexpected error occurred" };
    }
}

export async function deleteWorker(userId: string) {
    const supabaseAdmin = createAdminClient();

    try {
        const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
        if (error) return { error: error.message };

        revalidatePath("/admin/users");
        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}
