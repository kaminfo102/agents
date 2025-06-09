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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== "ADMIN") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const order = await prisma.order.findUnique({
      where: { id: params.orderId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            phoneNumber: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                image: true,
              },
            },
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

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (user?.role !== "ADMIN") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const { status, paymentStatus, description, items } = await request.json();
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

    // Delete existing items
    await prisma.orderItem.deleteMany({
      where: { orderId }
    });

    // Calculate total amount from items
    const totalAmount = items.reduce((total: number, item: any) => {
      return total + (item.price * item.quantity);
    }, 0);

    // Update order and create new items
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        paymentStatus,
        description,
        totalAmount,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            phoneNumber: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                image: true,
              },
            },
          },
        },
        payments: {
          select: {
            id: true,
            amount: true,
          },
        },
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("[ADMIN_ORDER_UPDATE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== "ADMIN") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const body = await request.json();
    const { status, paymentStatus } = body;

    if (!status && !paymentStatus) {
      return new NextResponse("Status or payment status is required", { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: params.orderId },
    });

    if (!order) {
      return new NextResponse("Order not found", { status: 404 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: params.orderId },
      data: {
        ...(status && { status }),
        ...(paymentStatus && { paymentStatus }),
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            phoneNumber: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                image: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("[ORDER_PATCH]", error);
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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== "ADMIN") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const order = await prisma.order.findUnique({
      where: { id: params.orderId },
      include: {
        payments: true,
      },
    });

    if (!order) {
      return new NextResponse("Order not found", { status: 404 });
    }

    if (order.payments.length > 0) {
      return new NextResponse(
        "Cannot delete order with existing payments",
        { status: 400 }
      );
    }

    await prisma.orderItem.deleteMany({
      where: { orderId: params.orderId },
    });

    await prisma.order.delete({
      where: { id: params.orderId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[ORDER_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 