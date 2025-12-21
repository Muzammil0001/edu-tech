import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const body = await req.json();
        const { title, startTime, endTime, lessonId } = body;

        const updated = await prisma.exam.update({
            where: { id: parseInt(id) },
            data: {
                title,
                startTime,
                endTime,
                lessonId: parseInt(lessonId),
            },
        });

        return NextResponse.json({ success: true, data: updated });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
