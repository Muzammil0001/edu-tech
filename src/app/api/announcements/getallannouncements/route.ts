import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const announcements = await prisma.announcement.findMany({
            include: {
                class: true,
            },
        });

        return NextResponse.json({ success: true, data: announcements });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
