import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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

export async function GET(req: Request) {
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

    const orders = await prisma.order.findMany({
      select: {
        id: true,
        orderNumber: true,
        status: true,
        paymentStatus: true,
        totalAmount: true,
        description: true,
        createdAt: true,
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("[ADMIN_ORDERS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(req: Request) {
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

    const { representativeId, items, description } = await req.json();

    if (!representativeId || !items || !Array.isArray(items) || items.length === 0) {
      return new NextResponse("Invalid order data", { status: 400 });
    }

    // Validate representative exists
    const representative = await prisma.user.findUnique({
      where: { id: representativeId },
      select: { id: true }
    });

    if (!representative) {
      return new NextResponse("Representative not found", { status: 404 });
    }

    // Get products to calculate prices
    const productIds = items.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds
        }
      }
    });

    // Validate all products exist
    const missingProducts = productIds.filter(id => !products.some(p => p.id === id));
    if (missingProducts.length > 0) {
      return new NextResponse(`Products not found: ${missingProducts.join(', ')}`, { status: 404 });
    }

    // Calculate total amount and prepare order items
    const orderItems = items.map(item => {
      const product = products.find(p => p.id === item.productId);
      return {
        productId: item.productId,
        quantity: item.quantity,
        price: product!.price
      };
    });

    const totalAmount = orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);

    // Generate order number
    const orderNumber = await generateOrderNumber();

    // Create order with items using a transaction
    const order = await prisma.$transaction(async (tx) => {
      // First create the order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: representativeId,
          status: "PENDING",
          paymentStatus: "UNPAID",
          description,
          totalAmount,
        },
      });

      // Group items by productId and sum quantities
      const groupedItems = orderItems.reduce((acc, item) => {
        const existing = acc.find(i => i.productId === item.productId);
        if (existing) {
          existing.quantity += item.quantity;
        } else {
          acc.push({ ...item });
        }
        return acc;
      }, [] as typeof orderItems);

      // Create order items with combined quantities
      await Promise.all(
        groupedItems.map(item =>
          tx.orderItem.create({
            data: {
              orderId: newOrder.id,
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            },
          })
        )
      );

      // Return the complete order with items
      return tx.order.findUnique({
        where: { id: newOrder.id },
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
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("[ADMIN_ORDERS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 