import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth-config";

// GET /api/representatives/[representativeId]
export async function GET(
  req: Request,
  { params }: { params: { representativeId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const representative = await prisma.user.findUnique({
      where: {
        id: params.representativeId,
        role: "REPRESENTATIVE",
      },
      include: {
        documents: {
          orderBy: {
            createdAt: "desc",
          },
        },
        contracts: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!representative) {
      return new NextResponse("Representative not found", { status: 404 });
    }

    return NextResponse.json(representative);
  } catch (error) {
    console.error("[REPRESENTATIVE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

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
    const { 
      firstName, 
      lastName, 
      fatherName,
      nationalId, 
      phoneNumber, 
      city, 
      address,
      educationCenter,
      isActive,
      profileImage 
    } = body;

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
        fatherName,
        nationalId,
        phoneNumber,
        city,
        address,
        educationCenter,
        isActive,
        profileImage,
        role: "REPRESENTATIVE", // Ensure role stays as REPRESENTATIVE
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