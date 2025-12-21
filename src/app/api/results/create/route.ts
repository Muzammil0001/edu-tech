import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { score, studentId, examId, assignmentId } = body;

        const result = await prisma.result.create({
            data: {
                score: parseInt(score),
                studentId,
                examId: examId ? parseInt(examId) : null,
                assignmentId: assignmentId ? parseInt(assignmentId) : null,
            },
        });

        return NextResponse.json({ success: true, data: result }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
