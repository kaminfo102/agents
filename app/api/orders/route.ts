import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Prisma } from '@prisma/client';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("[ORDERS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

async function generateOrderNumber() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');

  // Get the last order number for this month
  const lastOrder = await prisma.order.findFirst({
    where: {
      orderNumber: {
        startsWith: `${year}-${month}-`
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  let sequence = 1;
  if (lastOrder && lastOrder.orderNumber) {
    const lastSequence = parseInt(lastOrder.orderNumber.split('-')[2]);
    sequence = lastSequence + 1;
  }

  return `${year}-${month}-${String(sequence).padStart(4, '0')}`;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { items, description } = await req.json();
    type Item = { productId: string; quantity: number };
    const typedItems: Item[] = items;

    // Get products to calculate prices
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: typedItems.map(item => item.productId)
        }
      }
    });

    // Calculate total amount and prepare order items with prices
    const orderItems = typedItems.map(item => {
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

    // Generate order number
    const orderNumber = await generateOrderNumber();

    // Create order with order number and user connection
    const orderData: Prisma.OrderCreateInput = {
      orderNumber,
      user: {
        connect: {
          id: session.user.id
        }
      },
      description,
      totalAmount,
      items: {
        create: orderItems
      }
    };

    const order = await prisma.order.create({
      data: orderData,
      include: {
        items: true
      }
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id, items, ...orderData } = await req.json();
    type Item = { productId: string; quantity: number };
    const typedItems: Item[] = items;

    // Delete existing items
    await prisma.orderItem.deleteMany({
      where: { orderId: id }
    });

    // Get products to calculate prices
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: typedItems.map((item) => item.productId)
        }
      }
    });

    // Calculate total amount and prepare order items
    const orderItems = typedItems.map((item) => {
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

    // Update order and create new items
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        ...orderData,
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
    console.error("[ORDERS_PUT]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await req.json();
    
    await prisma.order.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ORDERS_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}