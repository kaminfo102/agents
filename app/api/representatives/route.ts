import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const representatives = await prisma.user.findMany({
      where: {
        role: "REPRESENTATIVE",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(representatives);
  } catch (error) {
    console.error("[REPRESENTATIVES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
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

    if (!firstName || !lastName || !nationalId || !phoneNumber || !city) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Check if representative with same national ID already exists
    const existingRepresentative = await prisma.user.findFirst({
      where: {
        nationalId,
        role: "REPRESENTATIVE",
      },
    });

    if (existingRepresentative) {
      return new NextResponse("Representative with this national ID already exists", { status: 400 });
    }

    const representative = await prisma.user.create({
      data: {
        firstName,
        lastName,
        fatherName,
        nationalId,
        phoneNumber,
        city,
        address,
        educationCenter,
        isActive: isActive ?? true,
        profileImage,
        role: "REPRESENTATIVE",
      },
    });

    return NextResponse.json(representative);
  } catch (error) {
    console.error("[REPRESENTATIVES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id, ...data } = await request.json();

    const updatedRepresentative = await prisma.user.update({
      where: { id },
      data: {
        ...data,
        role: "REPRESENTATIVE", // Ensure role stays as REPRESENTATIVE
      },
    });

    return NextResponse.json(updatedRepresentative);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}