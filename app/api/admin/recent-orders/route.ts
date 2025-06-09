import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Get recent orders from representatives
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      where: {
        user: {
          role: "REPRESENTATIVE"
        }
      },
      select: {
        id: true,
        createdAt: true,
        status: true,
        totalAmount: true,
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    // Format orders for the component
    const formattedOrders = recentOrders.map(order => ({
      id: order.id,
      representativeName: `${order.user.firstName} ${order.user.lastName}`,
      date: order.createdAt,
      status: order.status,
      amount: order.totalAmount
    }));

    return NextResponse.json(formattedOrders);
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 