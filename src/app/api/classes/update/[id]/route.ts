import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const body = await req.json();
        const updated = await prisma.class.update({
            where: { id: parseInt(id) },
            data: {
                name: body.name,
                capacity: body.capacity ? parseInt(body.capacity) : undefined,
                gradeId: body.gradeId ? parseInt(body.gradeId) : undefined,
                supervisorId: body.supervisorId,
            },
        });
        return NextResponse.json({ success: true, data: updated });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
