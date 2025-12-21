import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const students = await prisma.student.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                class: true,
                grade: true,
                parent: true,
            }
        });

        return NextResponse.json({ success: true, data: students });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
