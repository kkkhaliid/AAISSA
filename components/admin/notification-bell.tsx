"use client";

import { useEffect, useState } from "react";
import { Bell, AlertTriangle, CreditCard, ChevronRight } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

interface Notification {
    id: string;
    type: 'debt' | 'stock';
    title: string;
    description: string;
    time: string;
    link: string;
    priority: 'high' | 'medium';
}

export function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAlerts = async () => {
        const supabase = createClient();

        // 1. Fetch Overdue Debts
        const { data: debts } = await supabase
            .from('debts')
            .select('id, customer_name, total_amount, paid_amount, due_date')
            .eq('status', 'overdue')
            .limit(3);

        // 2. Fetch Low Stock
        const { data: products } = await supabase
            .from('products')
            .select('id, stock, product_templates(name)')
            .lt('stock', 5)
            .limit(3);

        const newAlerts: Notification[] = [];

        debts?.forEach(d => {
            newAlerts.push({
                id: `debt-${d.id}`,
                type: 'debt',
                title: 'دين متأخر',
                description: `العميل ${d.customer_name} تجاوز موعد الدفع`,
                time: 'تنبيه نشط',
                link: '/admin/debts',
                priority: 'high'
            });
        });

        products?.forEach(p => {
            // @ts-ignore
            const templateName = Array.isArray(p.product_templates) ? p.product_templates[0]?.name : p.product_templates?.name;
            newAlerts.push({
                id: `stock-${p.id}`,
                type: 'stock',
                title: 'مخزون منخفض',
                description: `المنتج ${templateName || 'غير معروف'} أوشك على النفاد (${p.stock})`,
                time: 'يحتاج طلب',
                link: '/admin/products',
                priority: 'medium'
            });
        });

        setNotifications(newAlerts);
        setLoading(false);
    };

    useEffect(() => {
        fetchAlerts();
        const interval = setInterval(fetchAlerts, 60000 * 5); // Refresh every 5 mins
        return () => clearInterval(interval);
    }, []);

    const hasUnread = notifications.length > 0;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative w-12 h-12 rounded-2xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200/50 dark:border-white/5 hover:bg-white dark:hover:bg-slate-800 transition-all active:scale-95 group">
                    <Bell className={cn("w-6 h-6 text-slate-500 group-hover:text-primary transition-colors", hasUnread && "animate-[bell-ring_1s_infinite]")} />
                    {hasUnread && (
                        <span className="absolute top-3 right-3 w-3 h-3 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-2 mt-4 glass dark:glass-dark border-0 shadow-2xl rounded-[2rem] overflow-hidden">
                <div className="flex items-center justify-between p-4 pb-2">
                    <h3 className="font-black text-lg text-slate-900 dark:text-white">التنبيهات</h3>
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                        {notifications.length} جديد
                    </span>
                </div>
                <DropdownMenuSeparator className="bg-slate-100 dark:bg-white/5 mx-2 my-2" />

                <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-2 space-y-2">
                    {loading ? (
                        <div className="py-10 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">
                            جاري جلب التنبيهات...
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="py-10 text-center">
                            <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                <Bell className="w-5 h-5 text-slate-300" />
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">لا توجد تنبيهات حالياً</p>
                        </div>
                    ) : (
                        notifications.map((n) => (
                            <Link key={n.id} href={n.link}>
                                <DropdownMenuItem className="flex flex-col items-start gap-1 p-4 rounded-2xl cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-all outline-none border-0 group mb-1">
                                    <div className="flex items-center gap-3 w-full">
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                                            n.type === 'debt' ? "bg-rose-500/10 text-rose-500" : "bg-amber-500/10 text-amber-500"
                                        )}>
                                            {n.type === 'debt' ? <CreditCard className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-primary transition-colors">{n.title}</p>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{n.description}</p>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-[-2px] transition-transform" />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{n.time}</span>
                                </DropdownMenuItem>
                            </Link>
                        ))
                    )}
                </div>

                <DropdownMenuSeparator className="bg-slate-100 dark:bg-white/5 mx-2 my-2" />
                <Link href="/admin/dashboard" className="block p-2">
                    <Button variant="ghost" className="w-full rounded-xl font-black text-xs text-slate-500 hover:text-primary uppercase tracking-widest">
                        مشاهدة التفاصيل
                    </Button>
                </Link>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
