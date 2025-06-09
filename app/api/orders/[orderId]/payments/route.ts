import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const formData = await request.formData();
    const amount = parseFloat(formData.get("amount") as string);
    const paymentDate = new Date(formData.get("paymentDate") as string);
    const receiptImage = formData.get("receiptImage") as File;

    if (!amount || !paymentDate || !receiptImage) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Check if order exists and belongs to the user
    const order = await prisma.order.findFirst({
      where: {
        id: params.orderId,
        userId: session.user.id,
      },
      include: {
        payments: true,
      },
    });

    if (!order) {
      return new NextResponse("Order not found", { status: 404 });
    }

    // Create uploads directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'receipts');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Save receipt image
    const bytes = await receiptImage.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${Date.now()}-${receiptImage.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        amount,
        paymentDate,
        receiptImage: `/uploads/receipts/${fileName}`,
      },
    });

    // Calculate total paid amount
    const totalPaid = order.payments.reduce((sum, p) => sum + p.amount, 0) + amount;
    const paymentStatus = totalPaid >= order.totalAmount
      ? "PAID"
      : totalPaid > 0
        ? "PARTIALLY_PAID"
        : "UNPAID";

    // Update order payment status
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentStatus },
    });

    return NextResponse.json(payment);
  } catch (error) {
    console.error("[PAYMENT_CREATE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const payments = await prisma.payment.findMany({
      where: {
        orderId: params.orderId,
        order: {
          userId: session.user.id,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error("[PAYMENTS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 