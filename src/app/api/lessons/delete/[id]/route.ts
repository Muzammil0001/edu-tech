import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        await prisma.lesson.delete({
            where: { id: parseInt(id) },
        });
        return NextResponse.json({ success: true, message: "Lesson deleted" });
    } catch (error: any) {
        let message = "Failed to delete lesson";
        if (error.code === 'P2003') {
            message = "Unable to delete lesson because it has associated exams, assignments, or results.";
        }
        return NextResponse.json(
            { success: false, message: message || error.message },
            { status: 500 }
        );
    }
}
