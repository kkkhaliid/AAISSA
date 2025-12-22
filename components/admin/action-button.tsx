"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ActionButtonProps {
    action: (id: string, formData: FormData) => Promise<{ error?: string; success?: boolean }>;
    id: string;
    label: string;
    children?: React.ReactNode;
    className?: string;
}

export function ActionButton({ action, id, label, children, className }: ActionButtonProps) {
    const [isPending, startTransition] = useTransition();

    const handleClick = () => {
        const formData = new FormData();
        startTransition(async () => {
            const result = await action(id, formData);
            if (result?.error) {
                toast.error(result.error);
            } else {
                toast.success("Action completed successfully");
            }
        });
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleClick}
            disabled={isPending}
            className={className}
        >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : children}
            {!isPending && label}
        </Button>
    );
}
