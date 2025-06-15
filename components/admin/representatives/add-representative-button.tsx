"use client";

import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AddRepresentativeButton() {
  const router = useRouter();

  return (
    <Button onClick={() => router.push("/admin/representatives/new")}>
      <UserPlus className="ml-2 h-4 w-4" />
      افزودن نماینده
    </Button>
  );
}