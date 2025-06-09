import { ProductList } from "@/components/admin/products/product-list";
import { AddProductButton } from "@/components/admin/products/add-product-button";

export default async function Products() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">مدیریت محصولات</h1>
        {/* <AddProductButton /> */}
      </div>
      <div className="bg-card rounded-lg shadow-sm">
        <ProductList />
      </div>
    </div>
  );
}