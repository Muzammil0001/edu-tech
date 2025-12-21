import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const lesson = await prisma.lesson.findUnique({
            where: { id: parseInt(id) },
            include: { subject: true, class: true, teacher: true },
        });
        if (!lesson) return NextResponse.json({ success: false, message: "Lesson not found" }, { status: 404 });
        return NextResponse.json({ success: true, data: lesson });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
