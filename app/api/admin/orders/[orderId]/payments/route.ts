import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const order = await prisma.order.findUnique({
      where: {
        id: params.orderId,
      },
      include: {
        payments: {
          orderBy: {
            paymentDate: "desc",
          },
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!order) {
      return new NextResponse("Order not found", { status: 404 });
    }

    const formattedPayments = order.payments.map((payment) => ({
      id: payment.id,
      orderNumber: order.orderNumber,
      orderDate: order.createdAt.toISOString(),
      paymentDate: payment.paymentDate.toISOString(),
      amount: payment.amount,
      receiptImage: payment.receiptImage,
      agent: {
        firstName: order.user.firstName,
        lastName: order.user.lastName,
      },
    }));

    return NextResponse.json(formattedPayments);
  } catch (error) {
    console.error("[ORDER_PAYMENTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 