import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: 'خطا در دریافت محصولات' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { title, description, price, image, category, stock } = data;

    const newProduct = await prisma.product.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        image,
        category: category || 'other',
        stock: stock ? parseInt(stock) : 0,
        createdAt: new Date(),
      }
    });

    return NextResponse.json(newProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'خطا در ایجاد محصول' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, ...data } = await request.json();
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      }
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    return NextResponse.json({ error: 'خطا در بروزرسانی محصول' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    await prisma.product.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'خطا در حذف محصول' }, { status: 500 });
  }
}