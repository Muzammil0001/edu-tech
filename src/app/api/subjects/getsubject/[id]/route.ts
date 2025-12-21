import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const subject = await prisma.subject.findUnique({
            where: { id: parseInt(id) },
            include: { teachers: true },
        });
        if (!subject) return NextResponse.json({ success: false, message: "Subject not found" }, { status: 404 });
        return NextResponse.json({ success: true, data: subject });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
