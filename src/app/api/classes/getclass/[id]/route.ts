import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const cls = await prisma.class.findUnique({
            where: { id: parseInt(id) },
            include: { grade: true, supervisor: true },
        });
        if (!cls) return NextResponse.json({ success: false, message: "Class not found" }, { status: 404 });
        return NextResponse.json({ success: true, data: cls });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
