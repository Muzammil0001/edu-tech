import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const lessons = await prisma.lesson.findMany({
            include: {
                subject: true,
                class: true,
                teacher: true,
            },
        });

        return NextResponse.json({ success: true, data: lessons });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
