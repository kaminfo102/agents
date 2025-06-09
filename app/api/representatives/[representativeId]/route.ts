import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth-config";

// PATCH /api/representatives/[representativeId]
export async function PATCH(
  req: Request,
  { params }: { params: { representativeId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { firstName, lastName, nationalId, phoneNumber, city, educationCenter, isActive } = body;

    if (!params.representativeId) {
      return new NextResponse("Representative ID is required", { status: 400 });
    }

    const representative = await prisma.user.update({
      where: {
        id: params.representativeId,
      },
      data: {
        firstName,
        lastName,
        nationalId,
        phoneNumber,
        city,
        educationCenter,
        isActive,
      },
    });

    return NextResponse.json(representative);
  } catch (error) {
    console.error("[REPRESENTATIVE_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// DELETE /api/representatives/[representativeId]
export async function DELETE(
  req: Request,
  { params }: { params: { representativeId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!params.representativeId) {
      return new NextResponse("Representative ID is required", { status: 400 });
    }

    await prisma.user.delete({
      where: {
        id: params.representativeId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[REPRESENTATIVE_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 