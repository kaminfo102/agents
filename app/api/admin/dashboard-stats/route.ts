import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { subMonths } from "date-fns";

export async function GET() {
  try {
    const now = new Date();
    const lastMonth = subMonths(now, 1);

    // Get total and active representatives
    const [totalRepresentatives, activeRepresentatives] = await Promise.all([
      prisma.user.count({
        where: { role: "REPRESENTATIVE" }
      }),
      prisma.user.count({
        where: { 
          role: "REPRESENTATIVE",
          isActive: true
        }
      })
    ]);

    // Get total and new products
    const [totalProducts, newProducts] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({
        where: {
          createdAt: {
            gte: lastMonth
          }
        }
      })
    ]);

    // Get total and pending orders
    const [totalOrders, pendingOrders] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({
        where: {
          status: "PENDING"
        }
      })
    ]);

    // Get total and unread messages
    const [totalMessages, unreadMessages] = await Promise.all([
      prisma.message.count(),
      prisma.message.count({
        where: {
          isRead: false
        }
      })
    ]);

    // Calculate changes from last month
    const lastMonthRepresentatives = await prisma.user.count({
      where: {
        role: "REPRESENTATIVE",
        createdAt: {
          lt: lastMonth
        }
      }
    });

    const lastMonthProducts = await prisma.product.count({
      where: {
        createdAt: {
          lt: lastMonth
        }
      }
    });

    const lastMonthOrders = await prisma.order.count({
      where: {
        createdAt: {
          lt: lastMonth
        }
      }
    });

    const lastMonthMessages = await prisma.message.count({
      where: {
        createdAt: {
          lt: lastMonth
        }
      }
    });

    // Calculate percentage changes
    const representativeChange = lastMonthRepresentatives === 0 ? 0 :
      Math.round(((totalRepresentatives - lastMonthRepresentatives) / lastMonthRepresentatives) * 100);
    
    const productChange = lastMonthProducts === 0 ? 0 :
      Math.round(((totalProducts - lastMonthProducts) / lastMonthProducts) * 100);
    
    const orderChange = lastMonthOrders === 0 ? 0 :
      Math.round(((totalOrders - lastMonthOrders) / lastMonthOrders) * 100);
    
    const messageChange = lastMonthMessages === 0 ? 0 :
      Math.round(((totalMessages - lastMonthMessages) / lastMonthMessages) * 100);

    return NextResponse.json({
      totalRepresentatives,
      activeRepresentatives,
      totalProducts,
      newProducts,
      totalOrders,
      pendingOrders,
      totalMessages,
      unreadMessages,
      representativeChange,
      productChange,
      orderChange,
      messageChange
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 