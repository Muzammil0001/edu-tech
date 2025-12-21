import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, day, startTime, endTime, subjectId, classId, teacherId } = body;

        const lesson = await prisma.lesson.create({
            data: {
                name,
                day: day as any,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                subjectId: parseInt(subjectId),
                classId: parseInt(classId),
                teacherId,
            },
        });

        return NextResponse.json({ success: true, data: lesson }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
