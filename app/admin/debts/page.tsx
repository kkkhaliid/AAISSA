import { Suspense } from "react";
import { getDebts } from "./actions";
import { DebtsManager } from "@/components/admin/debts-manager";
import { CreditCard, Wallet, AlertCircle } from "lucide-react";

export default async function DebtsPage() {
    return (
        <div className="space-y-8 md:space-y-10 pb-12" dir="rtl">
            <div className="flex flex-col items-center md:items-start text-center md:text-right px-4 md:px-0">
                <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
                    إدارة الديون
                </h1>
                <p className="text-slate-500 font-medium text-sm md:text-lg mt-2">
                    تتبع المبالغ المستحقة وتحصيل الدفعات من العملاء
                </p>
            </div>

            <Suspense fallback={<StatsSkeleton />}>
                <DebtsContent />
            </Suspense>
        </div>
    );
}

async function DebtsContent() {
    const debts = await getDebts();

    const stats = {
        total: debts.reduce((sum, d) => sum + (d.total_amount - d.paid_amount), 0),
        count: debts.filter(d => d.status !== 'paid').length,
        overdue: debts.filter(d => d.status === 'overdue').length
    };

    return (
        <div className="space-y-8">
            {/* Stats Cards - Premium Redesign */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 px-4 md:px-0">
                <div className="group relative bg-slate-900 dark:bg-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-8 text-white dark:text-slate-900 shadow-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2">
                    <div className="absolute -right-8 -top-8 w-32 md:w-48 h-32 md:h-48 bg-white/5 dark:bg-black/5 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000" />
                    <div className="absolute -left-4 footer-gradient w-32 h-32 opacity-20 blur-2xl" />

                    <div className="relative z-10 space-y-3 md:space-y-4">
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-white/10 dark:bg-slate-900/5 flex items-center justify-center backdrop-blur-md ring-1 ring-white/20 dark:ring-black/5">
                            <Wallet className="w-6 h-6 md:w-7 md:h-7 text-white dark:text-slate-900 opacity-80" />
                        </div>
                        <div>
                            <p className="text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.2em] text-[8px] md:text-[10px]">إجمالي الديون المعلقة</p>
                            <h3 className="text-2xl md:text-4xl font-black mt-1 tracking-tighter tabular-nums">{stats.total.toLocaleString()} <span className="text-xs md:text-sm font-bold opacity-60">DH</span></h3>
                        </div>
                    </div>
                </div>

                <div className="group relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white dark:border-white/5 rounded-[2rem] md:rounded-[3rem] p-6 md:p-8 shadow-premium overflow-hidden transition-all duration-500 hover:-translate-y-2">
                    <div className="absolute -right-8 -top-8 w-32 md:w-48 h-32 md:h-48 bg-emerald-500/5 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000" />

                    <div className="relative z-10 space-y-3 md:space-y-4">
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-emerald-500/10 flex items-center justify-center ring-1 ring-emerald-500/20">
                            <CreditCard className="w-6 h-6 md:w-7 md:h-7 text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.2em] text-[8px] md:text-[10px]">عدد الحالات النشطة</p>
                            <h3 className="text-2xl md:text-4xl font-black mt-1 tracking-tighter text-slate-900 dark:text-white tabular-nums">{stats.count} <span className="text-xs md:text-sm font-bold opacity-60 uppercase tracking-tight">عملاء</span></h3>
                        </div>
                    </div>
                </div>

                <div className="group relative bg-rose-500/5 dark:bg-rose-500/5 backdrop-blur-2xl border border-rose-500/10 rounded-[2rem] md:rounded-[3rem] p-6 md:p-8 shadow-xl overflow-hidden transition-all duration-500 hover:-translate-y-2">
                    <div className="absolute -right-8 -top-8 w-32 md:w-48 h-32 md:h-48 bg-rose-500/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000" />

                    <div className="relative z-10 space-y-3 md:space-y-4">
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-rose-500/10 flex items-center justify-center ring-1 ring-rose-500/20">
                            <AlertCircle className="w-6 h-6 md:w-7 md:h-7 text-rose-500" />
                        </div>
                        <div>
                            <p className="text-rose-600/60 dark:text-rose-400/60 font-black uppercase tracking-[0.2em] text-[8px] md:text-[10px]">ديون متأخرة</p>
                            <h3 className="text-2xl md:text-4xl font-black mt-1 tracking-tighter text-rose-600 tabular-nums">{stats.overdue} <span className="text-xs md:text-sm font-bold opacity-60 uppercase tracking-tight">حالة</span></h3>
                        </div>
                    </div>
                </div>
            </div>

            <DebtsManager initialDebts={debts} />
        </div>
    );
}

function StatsSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-pulse">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="h-[200px] bg-slate-100 dark:bg-slate-800 rounded-[3rem]" />
            ))}
        </div>
    );
}
