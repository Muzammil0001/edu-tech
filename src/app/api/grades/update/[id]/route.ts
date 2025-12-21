import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const body = await req.json();
        const { level } = body;

        const updated = await prisma.grade.update({
            where: { id: parseInt(id) },
            data: {
                level: parseInt(level),
            },
        });

        return NextResponse.json({ success: true, data: updated });
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ success: false, message: "Grade level already exists" }, { status: 409 });
        }
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
