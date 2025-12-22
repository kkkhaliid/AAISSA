"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ActionIconButtonProps {
    action: (id: string, formData: FormData) => Promise<{ error?: string; success?: boolean }>;
    id: string;
    children: React.ReactNode;
    variant?: "ghost" | "destructive" | "outline";
    className?: string;
}

export function ActionIconButton({ action, id, children, variant = "ghost", className }: ActionIconButtonProps) {
    const [isPending, startTransition] = useTransition();

    const handleClick = () => {
        const formData = new FormData();

        startTransition(async () => {
            const result = await action(id, formData);
            if (result?.error) {
                toast.error(result.error);
            } else {
                toast.success("تمت العملية بنجاح");
            }
        });
    };

    return (
        <Button
            variant={variant}
            size="icon"
            onClick={handleClick}
            disabled={isPending}
            className={className}
        >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : children}
        </Button>
    );
}
