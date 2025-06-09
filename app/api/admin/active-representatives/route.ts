import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Get active representatives with their orders
    const activeRepresentatives = await prisma.user.findMany({
      where: {
        role: "REPRESENTATIVE",
        isActive: true
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        city: true,
        profileImage: true,
        orders: {
          select: {
            id: true,
            createdAt: true,
            status: true
          }
        }
      }
    });

    // Calculate statistics and format data
    const formattedRepresentatives = activeRepresentatives.map((rep) => {
      // Get total orders count
      const totalOrders = rep.orders.length;

      // Calculate activity score based on recent orders (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentOrders = rep.orders.filter(order => 
        order.createdAt >= thirtyDaysAgo && 
        order.status !== "CANCELLED"
      ).length;

      // Calculate activity percentage (max 100%)
      // Base score on number of orders in last 30 days
      const activity = Math.min(Math.round((recentOrders / 5) * 100), 100);

      return {
        id: rep.id,
        name: `${rep.firstName} ${rep.lastName}`,
        city: rep.city || "نامشخص",
        activity,
        orders: totalOrders,
        image: rep.profileImage
      };
    });

    // Sort by activity score (highest first)
    formattedRepresentatives.sort((a, b) => b.activity - a.activity);

    return NextResponse.json(formattedRepresentatives);
  } catch (error) {
    console.error('Error fetching active representatives:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت اطلاعات نمایندگان' },
      { status: 500 }
    );
  }
} 