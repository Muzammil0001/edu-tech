import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { title, startDate, dueDate, lessonId } = body;

        const assignment = await prisma.assignment.create({
            data: {
                title,
                startDate: new Date(startDate),
                dueDate: new Date(dueDate),
                lessonId: parseInt(lessonId),
            },
        });

        return NextResponse.json({ success: true, data: assignment }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
