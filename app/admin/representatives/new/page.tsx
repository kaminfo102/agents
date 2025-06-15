import { RepresentativeForm } from "@/components/admin/representatives/representative-form";

export default function NewRepresentativePage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">افزودن نماینده جدید</h2>
      </div>
      <div className="grid gap-4">
        <RepresentativeForm />
      </div>
    </div>
  );
} 