import { RepresentativeForm } from "@/components/admin/representatives/representative-form";

export default function NewRepresentativePage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">ایجاد نماینده جدید</h3>
        <p className="text-sm text-muted-foreground">
          اطلاعات نماینده جدید را وارد کنید
        </p>
      </div>
      <RepresentativeForm />
    </div>
  );
} 