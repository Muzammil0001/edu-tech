import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const student = await prisma.student.findUnique({
            where: { id },
            include: {
                class: {
                    include: {
                        supervisor: true
                    }
                },
                grade: true,
                parent: true,
                results: {
                    include: {
                        exam: true,
                        assignment: true
                    }
                },
                attendances: true
            }
        });
        if (!student) return NextResponse.json({ success: false, message: "Student not found" }, { status: 404 });
        return NextResponse.json({ success: true, data: student });
    } catch (e: any) {
        return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
}
