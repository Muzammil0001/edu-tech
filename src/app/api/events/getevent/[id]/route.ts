import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const event = await prisma.event.findUnique({
            where: { id: parseInt(id) },
            include: { class: true },
        });
        if (!event) return NextResponse.json({ success: false, message: "Event not found" }, { status: 404 });
        return NextResponse.json({ success: true, data: event });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
