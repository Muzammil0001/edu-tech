import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const grade = await prisma.grade.findUnique({
            where: { id: parseInt(id) },
        });
        if (!grade) return NextResponse.json({ success: false, message: "Grade not found" }, { status: 404 });
        return NextResponse.json({ success: true, data: grade });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
