import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const announcement = await prisma.announcement.findUnique({
            where: { id: parseInt(id) },
            include: { class: true },
        });
        if (!announcement) return NextResponse.json({ success: false, message: "Announcement not found" }, { status: 404 });
        return NextResponse.json({ success: true, data: announcement });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
