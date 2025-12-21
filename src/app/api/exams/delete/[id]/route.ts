import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        await prisma.exam.delete({
            where: { id: parseInt(id) },
        });
        return NextResponse.json({ success: true, message: "Exam deleted" });
    } catch (error: any) {
        let message = "Failed to delete exam";
        if (error.code === 'P2003') {
            message = "Unable to delete exam because it has associated results.";
        }
        return NextResponse.json(
            { success: false, message: message || error.message },
            { status: 500 }
        );
    }
}
