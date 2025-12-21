import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const gradeId = parseInt(id);

        // Find if grade exists
        const grade = await prisma.grade.findUnique({ where: { id: gradeId } });
        if (!grade) {
            return NextResponse.json({ success: false, message: "Grade not found" }, { status: 404 });
        }

        // Try deleting
        try {
            await prisma.grade.delete({ where: { id: gradeId } });
        } catch (error: any) {
            if (error.code === 'P2003') {
                return NextResponse.json(
                    { success: false, message: "Unable to delete grade because it still has associated classes or students. Please delete or reassign them first." },
                    { status: 400 }
                );
            }
            throw error;
        }

        return NextResponse.json({ success: true, message: "Grade deleted successfully" });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status: 500 });
    }
}
