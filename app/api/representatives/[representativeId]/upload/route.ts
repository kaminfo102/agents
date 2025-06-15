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
    const type = formData.get("type") as string;

    if (!file || !type) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Create uploads directory if it doesn't exist
    const uploadDir = join(process.cwd(), "public", "uploads");
    await writeFile(join(uploadDir, file.name), Buffer.from(await file.arrayBuffer()));

    const fileUrl = `/uploads/${file.name}`;

    if (type === "document") {
      const document = await prisma.document.create({
        data: {
          title: file.name,
          fileUrl,
          fileType: file.type,
          userId: params.representativeId,
        },
      });
      return NextResponse.json(document);
    } else if (type === "contract") {
      const contract = await prisma.contract.create({
        data: {
          title: file.name,
          fileUrl,
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
          userId: params.representativeId,
        },
      });
      return NextResponse.json(contract);
    }

    return new NextResponse("Invalid type", { status: 400 });
  } catch (error) {
    console.error("[REPRESENTATIVE_UPLOAD]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 