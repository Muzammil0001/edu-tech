import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const grades = await prisma.grade.findMany({ orderBy: { level: "asc" } });
        return NextResponse.json({ success: true, data: grades });
    } catch (error) {
        return NextResponse.json({ success: false, message: "Failed to fetch grades" }, { status: 500 });
    }
}
