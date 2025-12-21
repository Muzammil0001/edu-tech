import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const subjectId = parseInt(id);

        // Find subject
        const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
        if (!subject) {
            return NextResponse.json({ success: false, message: "Subject not found" }, { status: 404 });
        }

        // Delete subject
        try {
            await prisma.subject.delete({
                where: { id: subjectId },
            });
        } catch (error: any) {
            if (error.code === 'P2003') {
                return NextResponse.json(
                    { success: false, message: "Unable to delete subject because it still has associated lessons. Please delete or reassign those lessons first." },
                    { status: 400 }
                );
            }
            throw error;
        }

        return NextResponse.json({ success: true, message: "Subject deleted successfully" });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
