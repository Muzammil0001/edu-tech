import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { title, startTime, endTime, lessonId } = body;

        const exam = await prisma.exam.create({
            data: {
                title,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                lessonId: parseInt(lessonId),
            },
        });

        return NextResponse.json({ success: true, data: exam }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
