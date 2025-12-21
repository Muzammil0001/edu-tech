import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, capacity, gradeId, supervisorId } = body;

        const newClass = await prisma.class.create({
            data: {
                name,
                capacity: parseInt(capacity),
                gradeId: parseInt(gradeId),
                supervisorId,
            },
        });

        return NextResponse.json({ success: true, data: newClass }, { status: 201 });
    } catch (error: any) {
        console.error("[CLASS_CREATE_ERROR]", error);
        return NextResponse.json(
            { success: false, message: error.message || "Failed to create class" },
            { status: 500 }
        );
    }
}
