import { login } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Smartphone, Mail, Lock, ArrowLeft, Sparkles } from "lucide-react";

export default async function LoginPage(props: {
    searchParams: Promise<{ error?: string }>
}) {
    const searchParams = await props.searchParams;

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-50 dark:bg-slate-950" dir="rtl">
            {/* Background Pattern */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-primary/10 rounded-full blur-3xl opacity-50" />
            </div>

            <div className="w-full max-w-lg px-4 relative z-10">
                {/* Logo & Branding */}
                <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2.5rem] bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xl shadow-slate-900/20 mb-6 rotate-3 hover:rotate-6 transition-transform duration-500">
                        <Smartphone className="w-10 h-10" />
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white mb-2">AissaPhone</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">نظام إدارة المبيعات الاحترافي</p>
                </div>

                {/* Login Card */}
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-premium p-8 md:p-10 border border-slate-100 dark:border-white/5 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white">تسجيل الدخول</h2>
                            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium">مرحباً بك مجدداً! أدخل بياناتك للمتابعة.</p>
                        </div>

                        {/* Error Message */}
                        {searchParams.error && (
                            <div className="bg-rose-50 dark:bg-rose-950/30 p-4 rounded-2xl flex items-center gap-3 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/20 animate-in shake">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <p className="text-sm font-bold">{searchParams.error}</p>
                            </div>
                        )}

                        <form action={login} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-widest mr-1">البريد الإلكتروني</Label>
                                <div className="relative group">
                                    <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-primary transition-colors" />
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="admin@aissaphone.com"
                                        required
                                        className="h-14 text-right pr-12 bg-slate-50 dark:bg-slate-800/50 border-0 ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary/20 rounded-2xl transition-all font-bold text-lg"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-widest mr-1">كلمة المرور</Label>
                                <div className="relative group">
                                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-primary transition-colors" />
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        placeholder="••••••••"
                                        required
                                        className="h-14 text-right pr-12 bg-slate-50 dark:bg-slate-800/50 border-0 ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary/20 rounded-2xl transition-all font-bold text-lg"
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-14 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-lg shadow-xl shadow-slate-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                            >
                                دخول للنظام
                            </Button>
                        </form>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center mt-8 text-slate-400 text-xs font-bold uppercase tracking-widest">
                    AissaPhone Cloud © 2024
                </p>
            </div>
        </div>
    );
}

import { AlertCircle } from "lucide-react";
