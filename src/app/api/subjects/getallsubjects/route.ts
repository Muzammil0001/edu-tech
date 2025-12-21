import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const subjects = await prisma.subject.findMany({
            include: {
                teachers: true,
            },
        });

        // Return the full objects so the frontend can handle formatting if needed, 
        // or just return as is if the frontend expects the structure.
        return NextResponse.json({ success: true, data: subjects });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
