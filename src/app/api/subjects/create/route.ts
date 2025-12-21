import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, teacherIds } = body;

        const subject = await prisma.subject.create({
            data: {
                name,
                teachers: teacherIds ? {
                    connect: teacherIds.map((id: string) => ({ id }))
                } : undefined,
            },
        });

        return NextResponse.json({ success: true, data: subject }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
