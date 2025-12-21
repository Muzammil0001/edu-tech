import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const events = await prisma.event.findMany({
            include: {
                class: true,
            },
        });

        return NextResponse.json({ success: true, data: events });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
