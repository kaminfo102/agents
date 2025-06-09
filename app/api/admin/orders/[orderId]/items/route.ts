import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (user?.role !== "ADMIN") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const { productId, quantity, price } = await request.json();
    const orderId = params.orderId;

    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true
      }
    });

    if (!order) {
      return new NextResponse("Order not found", { status: 404 });
    }

    // Create new order item
    const orderItem = await prisma.orderItem.create({
      data: {
        orderId,
        productId,
        quantity,
        price,
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            image: true,
          },
        },
      },
    });

    // Update order total amount
    const newTotalAmount = order.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0) + (price * quantity);

    await prisma.order.update({
      where: { id: orderId },
      data: {
        totalAmount: newTotalAmount,
      },
    });

    return NextResponse.json(orderItem);
  } catch (error) {
    console.error("[ADMIN_ORDER_ITEM_CREATE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (user?.role !== "ADMIN") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');

    if (!itemId) {
      return new NextResponse("Item ID is required", { status: 400 });
    }

    const orderId = params.orderId;

    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true
      }
    });

    if (!order) {
      return new NextResponse("Order not found", { status: 404 });
    }

    // Find the item to be deleted
    const itemToDelete = order.items.find(item => item.id === itemId);
    if (!itemToDelete) {
      return new NextResponse("Item not found", { status: 404 });
    }

    // Delete the item
    await prisma.orderItem.delete({
      where: { id: itemId }
    });

    // Update order total amount
    const newTotalAmount = order.items
      .filter(item => item.id !== itemId)
      .reduce((total, item) => {
        return total + (item.price * item.quantity);
      }, 0);

    await prisma.order.update({
      where: { id: orderId },
      data: {
        totalAmount: newTotalAmount,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[ADMIN_ORDER_ITEM_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 