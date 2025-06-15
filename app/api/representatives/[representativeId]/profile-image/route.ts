import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth-config";
import { writeFile } from "fs/promises";
import { join } from "path";

export async function POST(
  req: Request,
  { params }: { params: { representativeId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new NextResponse("Missing file", { status: 400 });
    }

    // Create uploads directory if it doesn't exist
    const uploadDir = join(process.cwd(), "public", "uploads");
    const fileName = `profile-${params.representativeId}-${Date.now()}.${file.name.split(".").pop()}`;
    await writeFile(join(uploadDir, fileName), Buffer.from(await file.arrayBuffer()));

    const fileUrl = `/uploads/${fileName}`;

    // Update user profile image
    await prisma.user.update({
      where: {
        id: params.representativeId,
      },
      data: {
        profileImage: fileUrl,
      },
    });

    return NextResponse.json({ fileUrl });
  } catch (error) {
    console.error("[REPRESENTATIVE_PROFILE_IMAGE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 