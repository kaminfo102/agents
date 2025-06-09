import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-24 bg-gradient-to-b from-background to-muted">
      <div className="w-full max-w-md p-6 bg-card rounded-xl shadow-lg fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">سامانه مدیریت نمایندگان</h1>
          <p className="text-muted-foreground mt-2">لطفا وارد حساب کاربری خود شوید</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}