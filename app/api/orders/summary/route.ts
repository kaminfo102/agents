import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

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
      select: {
        status: true,
      },
    });

    const summary = {
      total: orders.length,
      pending: orders.filter(order => order.status === "PENDING").length,
      processing: orders.filter(order => order.status === "PROCESSING").length,
      completed: orders.filter(order => order.status === "COMPLETED").length,
      cancelled: orders.filter(order => order.status === "CANCELLED").length,
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error("[ORDERS_SUMMARY_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 