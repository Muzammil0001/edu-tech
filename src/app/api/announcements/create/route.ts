import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { title, description, date, classId } = body;

        const announcement = await prisma.announcement.create({
            data: {
                title,
                description,
                date: new Date(date),
                classId: classId ? parseInt(classId) : null,
            },
        });

        return NextResponse.json({ success: true, data: announcement }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
