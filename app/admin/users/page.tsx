import { createClient } from "@/utils/supabase/server";
import { UsersManager } from "@/components/admin/users-manager";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserCircle, Shield, Store } from "lucide-react";

export default async function UsersPage() {
    const supabase = await createClient();

    const { data: stores } = await supabase.from("stores").select("id, name");
    const { data: profiles } = await supabase
        .from("profiles")
        .select("*, stores(name)")
        .order("created_at", { ascending: false });

    return (
        <UsersManager initialUsers={profiles || []} stores={stores || []} />
    );
}
