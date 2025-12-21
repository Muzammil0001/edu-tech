import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const body = await req.json();
        const { name, teacherIds } = body;

        const updated = await prisma.subject.update({
            where: { id: parseInt(id) },
            data: {
                name,
                teachers: teacherIds ? {
                    set: teacherIds.map((tid: string) => ({ id: tid }))
                } : undefined,
            },
        });

        return NextResponse.json({ success: true, data: updated });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
