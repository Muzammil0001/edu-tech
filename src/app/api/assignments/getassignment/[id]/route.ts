import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const assignment = await prisma.assignment.findUnique({
            where: { id: parseInt(id) },
            include: { lesson: { include: { subject: true, class: true } } },
        });
        if (!assignment) return NextResponse.json({ success: false, message: "Assignment not found" }, { status: 404 });
        return NextResponse.json({ success: true, data: assignment });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
