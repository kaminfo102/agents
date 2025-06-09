import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.productId }
    });

    if (!product) {
      return NextResponse.json({ error: 'محصول یافت نشد' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'خطا در دریافت اطلاعات محصول' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const data = await request.json();
    const updatedProduct = await prisma.product.update({
      where: { id: params.productId },
      data: {
        ...data,
        updatedAt: new Date(),
      }
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'خطا در بروزرسانی محصول' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    await prisma.product.delete({
      where: { id: params.productId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'خطا در حذف محصول' }, { status: 500 });
  }
} 