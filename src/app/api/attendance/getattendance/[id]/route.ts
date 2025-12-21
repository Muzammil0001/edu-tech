import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const attendance = await prisma.attendance.findUnique({
            where: { id: parseInt(id) },
            include: { student: true, device: true },
        });
        if (!attendance) return NextResponse.json({ success: false, message: "Attendance not found" }, { status: 404 });
        return NextResponse.json({ success: true, data: attendance });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
