import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const classId = parseInt(id);

        // Find class
        const cls = await prisma.class.findUnique({ where: { id: classId } });
        if (!cls) {
            return NextResponse.json({ success: false, message: "Class not found" }, { status: 404 });
        }

        // Delete class
        try {
            await prisma.class.delete({
                where: { id: classId },
            });
        } catch (error: any) {
            if (error.code === 'P2003') {
                return NextResponse.json(
                    { success: false, message: "Unable to delete class because it still has associated students, lessons, events, or announcements. Please remove those dependencies first." },
                    { status: 400 }
                );
            }
            throw error;
        }

        return NextResponse.json({ success: true, message: "Class deleted successfully" });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
