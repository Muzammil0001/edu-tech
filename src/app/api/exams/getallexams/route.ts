import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const exams = await prisma.exam.findMany({
            include: {
                lesson: {
                    include: {
                        subject: true,
                        class: true,
                    },
                },
            },
        });

        return NextResponse.json({ success: true, data: exams });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
