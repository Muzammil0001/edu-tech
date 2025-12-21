import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const result = await prisma.result.findUnique({
            where: { id: parseInt(id) },
            include: { student: true, exam: true, assignment: true },
        });
        if (!result) return NextResponse.json({ success: false, message: "Result not found" }, { status: 404 });
        return NextResponse.json({ success: true, data: result });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
