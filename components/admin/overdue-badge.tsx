"use client";

import { useEffect, useState } from "react";
import { getOverdueCount } from "@/app/admin/debts/actions";
import { cn } from "@/lib/utils";

export function OverdueBadge() {
    const [count, setCount] = useState<number>(0);

    useEffect(() => {
        const fetchCount = async () => {
            const overdueCount = await getOverdueCount();
            setCount(overdueCount);
        };
        fetchCount();

        // Refresh every 5 minutes
        const interval = setInterval(fetchCount, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    if (count === 0) return null;

    return (
        <span className={cn(
            "ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white animate-pulse"
        )}>
            {count}
        </span>
    );
}
