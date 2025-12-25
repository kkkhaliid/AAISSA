import { login } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Smartphone, Mail, Lock, ArrowLeft, Sparkles } from "lucide-react";

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" dir="rtl">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Gradient Orbs */}
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-3xl" />

                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
            </div>

            {/* Main Container */}
            <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">

                    {/* Left Side - Branding (Hidden on Mobile) */}
                    <div className="hidden lg:flex flex-col space-y-8 animate-in fade-in slide-in-from-left duration-700">
                        {/* Logo & Brand */}
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl px-6 py-4 rounded-3xl shadow-2xl shadow-primary/10 ring-1 ring-white/20 dark:ring-white/10">
                                <div className="bg-gradient-to-br from-primary to-indigo-600 text-white w-16 h-16 rounded-2xl rotate-3 flex items-center justify-center shadow-xl shadow-primary/30 group-hover:rotate-6 transition-transform">
                                    <Smartphone className="w-8 h-8" />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                                        AissaPhone
                                    </h1>
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Store Management System</p>
                                </div>
                            </div>
                        </div>

                        {/* Feature Highlights */}
                        <div className="space-y-4">
                            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight">
                                إدارة متجرك<br />
                                <span className="bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">بكل سهولة واحترافية</span>
                            </h2>
                            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-md">
                                نظام متكامل لإدارة المبيعات والمخزون والموظفين مع تقارير تفصيلية ومتابعة دقيقة
                            </p>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { label: "مستخدم نشط", value: "500+" },
                                { label: "عملية بيع", value: "10K+" },
                                { label: "متجر", value: "50+" }
                            ].map((stat, i) => (
                                <div key={i} className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-4 rounded-2xl border border-white/20 dark:border-white/10 shadow-lg">
                                    <div className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</div>
                                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Side - Login Form */}
                    <div className="w-full max-w-md mx-auto lg:mx-0 animate-in fade-in slide-in-from-right duration-700">
                        {/* Mobile Logo (Visible on Mobile Only) */}
                        <div className="lg:hidden text-center mb-8 space-y-4">
                            <div className="inline-flex items-center gap-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl px-5 py-3 rounded-2xl shadow-xl ring-1 ring-black/5 dark:ring-white/10">
                                <div className="bg-gradient-to-br from-primary to-indigo-600 text-white w-12 h-12 rounded-xl rotate-3 flex items-center justify-center shadow-lg shadow-primary/30">
                                    <Smartphone className="w-6 h-6" />
                                </div>
                                <div className="text-left">
                                    <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">AissaPhone</h1>
                                    <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Store Management</p>
                                </div>
                            </div>
                        </div>

                        {/* Login Card */}
                        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-white/10 p-8 md:p-10 space-y-8 relative overflow-hidden">
                            {/* Card Glow Effect */}
                            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
                            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl" />

                            <div className="relative z-10 space-y-8">
                                {/* Header */}
                                <div className="text-center space-y-3">
                                    <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-black uppercase tracking-wider">
                                        <Sparkles className="w-4 h-4" />
                                        <span>مرحباً بك</span>
                                    </div>
                                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                                        تسجيل الدخول
                                    </h2>
                                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                                        أدخل بياناتك للوصول إلى لوحة التحكم
                                    </p>
                                </div>

                                {/* Form */}
                                <form action={login} className="space-y-6">
                                    {/* Email Field */}
                                    <div className="space-y-3">
                                        <Label htmlFor="email" className="text-slate-700 dark:text-slate-300 font-bold text-sm flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-primary" />
                                            البريد الإلكتروني
                                        </Label>
                                        <div className="relative group">
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                placeholder="name@company.com"
                                                required
                                                className="h-14 text-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all rounded-2xl pr-5 font-medium"
                                            />
                                        </div>
                                    </div>

                                    {/* Password Field */}
                                    <div className="space-y-3">
                                        <Label htmlFor="password" className="text-slate-700 dark:text-slate-300 font-bold text-sm flex items-center gap-2">
                                            <Lock className="w-4 h-4 text-primary" />
                                            كلمة المرور
                                        </Label>
                                        <div className="relative group">
                                            <Input
                                                id="password"
                                                name="password"
                                                type="password"
                                                required
                                                placeholder="••••••••"
                                                className="h-14 text-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all rounded-2xl pr-5 font-medium"
                                            />
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <Button
                                        type="submit"
                                        className="w-full h-14 text-lg font-black rounded-2xl bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 text-white shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 transition-all duration-300 active:scale-[0.98] group"
                                    >
                                        <span>تسجيل الدخول</span>
                                        <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                                    </Button>
                                </form>

                                {/* Footer Note */}
                                <div className="text-center pt-4 border-t border-slate-200 dark:border-slate-800">
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                        نظام آمن ومحمي بتشفير عالي المستوى 🔒
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
