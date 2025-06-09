import { RepresentativeList } from "@/components/admin/representatives/representative-list";
import { AddRepresentativeButton } from "@/components/admin/representatives/add-representative-button";

export default async function Representatives() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">مدیریت نمایندگان</h1>
        {/* <AddRepresentativeButton /> */}
      </div>
      <div className="bg-card rounded-lg shadow-sm">
        <RepresentativeList />
      </div>
    </div>
  );
}