import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { users } from "@clerk/clerk-sdk-node";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        // Find student to verify existence
        const student = await prisma.student.findUnique({ where: { id } });
        if (!student) {
            return NextResponse.json({ success: false, message: "Student not found" }, { status: 404 });
        }

        // Delete from DB first to check for dependencies (attendance, results)
        try {
            await prisma.student.delete({ where: { id } });
        } catch (error: any) {
            if (error.code === 'P2003') {
                return NextResponse.json(
                    { success: false, message: "Unable to delete student because they have existing attendance records or exam results. Remove these dependencies first." },
                    { status: 400 }
                );
            }
            throw error;
        }

        // Cleanup Clerk
        try { await users.deleteUser(id); } catch (e) { console.warn("Failed to delete Clerk user:", e); }

        return NextResponse.json({ success: true, message: "Student deleted successfully" });
    } catch (e: any) {
        return NextResponse.json({ success: false, message: e.message || "Internal server error" }, { status: 500 });
    }
}
