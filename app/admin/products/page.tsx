import { RepresentativeList } from "@/components/admin/representatives/representative-list";
import { AddRepresentativeButton } from "@/components/admin/representatives/add-representative-button";
import { ProductList } from "@/components/admin/products/product-list";
import ProductsPage from "@/components/admin/products/product_list";

export default async function Representatives() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">مدیریت محصولات</h1>
        
      </div>
      <div className="bg-card rounded-lg shadow-sm">
        {/* <ProductList /> */}
        <ProductsPage />
      </div>
    </div>
  );
}