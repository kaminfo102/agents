import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const order = await prisma.order.findFirst({
      where: {
        id: params.orderId,
        userId: session.user.id,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return new NextResponse("Order not found", { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("[ORDER_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { description, items } = await request.json();
    const orderId = params.orderId;

    // Check if order exists and belongs to the user
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: session.user.id,
        status: "PENDING",
      },
    });

    if (!order) {
      return new NextResponse("Order not found or cannot be edited", { status: 404 });
    }

    // Get products to calculate prices
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: items.map(item => item.productId)
        }
      }
    });

    // Calculate total amount and prepare order items
    const orderItems = items.map(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }
      return {
        productId: item.productId,
        quantity: item.quantity,
        price: product.price
      };
    });

    const totalAmount = orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);

    // Delete existing items
    await prisma.orderItem.deleteMany({
      where: { orderId }
    });

    // Update order with new items
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        description,
        totalAmount,
        items: {
          create: orderItems
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("[ORDER_UPDATE]", error);
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

    const orderId = params.orderId;

    // Check if order exists and belongs to the user
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: session.user.id,
        status: "PENDING",
      },
    });

    if (!order) {
      return new NextResponse("Order not found or cannot be deleted", { status: 404 });
    }

    // Delete order items first
    await prisma.orderItem.deleteMany({
      where: { orderId },
    });

    // Delete order
    await prisma.order.delete({
      where: { id: orderId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[ORDER_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 