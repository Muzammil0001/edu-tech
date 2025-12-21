import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const exam = await prisma.exam.findUnique({
            where: { id: parseInt(id) },
            include: { lesson: { include: { subject: true, class: true } } },
        });
        if (!exam) return NextResponse.json({ success: false, message: "Exam not found" }, { status: 404 });
        return NextResponse.json({ success: true, data: exam });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
