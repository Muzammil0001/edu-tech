import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const classes = await prisma.class.findMany({
            include: { grade: true, supervisor: true }
        });
        return NextResponse.json({ success: true, data: classes });
    } catch (error) {
        return NextResponse.json({ success: false, message: "Failed to fetch classes" }, { status: 500 });
    }
}
