import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const parents = await prisma.parent.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                students: true,
            },
        });

        return NextResponse.json({ success: true, data: parents });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
