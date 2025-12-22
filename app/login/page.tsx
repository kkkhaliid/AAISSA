import { login } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone } from "lucide-react";

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] p-4" dir="rtl">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 md:p-12 space-y-8">

                <div className="text-center space-y-2">
                    <div className="mx-auto bg-primary text-white w-16 h-16 rounded-2xl rotate-3 flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
                        <Smartphone className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                        AissaPhone
                    </h1>
                    <p className="text-muted-foreground">
                        Store Management System
                    </p>
                </div>

                <form action={login} className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-right block font-medium">البريد الإلكتروني</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="name@company.com"
                                required
                                className="text-right h-12 text-lg bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-right block font-medium">كلمة المرور</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="text-right h-12 text-lg bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                            />
                        </div>
                    </div>

                    <Button type="submit" className="w-full font-bold text-lg h-14 rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all active:scale-[0.98]">
                        تسجيل الدخول
                    </Button>
                </form>
            </div>
        </div>
    );
}
