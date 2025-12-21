import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { users } from "@clerk/clerk-sdk-node";

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const parent = await prisma.parent.findUnique({ where: { id } });
        if (!parent) {
            return NextResponse.json({ success: false, message: "Parent not found" }, { status: 404 });
        }

        // Check for dependencies (students)
        try {
            await prisma.parent.delete({ where: { id } });
        } catch (error: any) {
            if (error.code === 'P2003') {
                return NextResponse.json(
                    { success: false, message: "Unable to delete parent because they still have registered students. Please delete or reassign the students first." },
                    { status: 400 }
                );
            }
            throw error;
        }

        try {
            await users.deleteUser(id);
        } catch (e) {
            console.warn("Deleted from database but Clerk user deletion failed or user already gone:", e);
        }

        return NextResponse.json({ success: true, message: "Parent deleted successfully" });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status: 500 });
    }
}
