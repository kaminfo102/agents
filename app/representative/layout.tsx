import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { RepresentativeSidebar } from "@/components/representative/representative-sidebar";
import { MobileHeader } from "@/components/shared/mobile-header";
import { authOptions } from "@/lib/auth-config";

export default async function RepresentativeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "REPRESENTATIVE") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-background">
      <RepresentativeSidebar className="hidden md:flex" />
      <div className="flex-1">
        <Suspense fallback={<div>Loading...</div>}>
          <MobileHeader label="پنل نماینده" />
        </Suspense>
        <main className="container mx-auto p-4 pt-16 md:pt-4 pb-20 md:pb-4 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}