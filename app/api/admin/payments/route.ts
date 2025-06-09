import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const payments = await prisma.payment.findMany({
      include: {
        order: {
          select: {
            orderNumber: true,
            createdAt: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: {
        paymentDate: "desc",
      },
    });

    const formattedPayments = payments.map((payment) => ({
      id: payment.id,
      orderNumber: payment.order.orderNumber,
      orderDate: payment.order.createdAt,
      paymentDate: payment.paymentDate,
      amount: payment.amount,
      receiptImage: payment.receiptImage,
      agent: {
        firstName: payment.order.user.firstName,
        lastName: payment.order.user.lastName,
      },
    }));

    return NextResponse.json(formattedPayments);
  } catch (error) {
    console.error("[PAYMENTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 