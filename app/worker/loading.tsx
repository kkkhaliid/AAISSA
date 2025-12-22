import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[85vh] overflow-hidden p-4 lg:p-0">
            {/* LEFT: Product Grid Skeleton */}
            <div className="flex-1 flex flex-col gap-4 min-w-0">
                {/* Search Bar */}
                <Skeleton className="h-14 w-full rounded-xl" />

                {/* Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pr-1 pb-20">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="aspect-square rounded-2xl border p-4 space-y-3">
                            <Skeleton className="w-full h-2/3 rounded-xl" />
                            <Skeleton className="w-3/4 h-4" />
                            <Skeleton className="w-1/2 h-6" />
                        </div>
                    ))}
                </div>
            </div>

            {/* RIGHT: Cart Sidebar Skeleton */}
            <div className="w-full lg:w-[400px] shrink-0 h-full border rounded-2xl p-4 space-y-4">
                <Skeleton className="h-12 w-full mb-4" />
                <div className="space-y-3">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
                </div>
                <div className="mt-auto pt-4 space-y-4 border-t">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-14 w-full rounded-xl" />
                </div>
            </div>
        </div>
    );
}
