import { RepresentativeDetails } from "@/components/admin/representatives/representative-details";

interface RepresentativePageProps {
  params: {
    representativeId: string;
  };
}

export default function RepresentativePage({ params }: RepresentativePageProps) {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">جزئیات نماینده</h2>
      </div>
      <div className="grid gap-4">
        <RepresentativeDetails representativeId={params.representativeId} />
      </div>
    </div>
  );
} 