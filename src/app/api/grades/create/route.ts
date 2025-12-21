import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { level } = body;

        const grade = await prisma.grade.create({
            data: {
                level: parseInt(level),
            },
        });

        return NextResponse.json({ success: true, data: grade }, { status: 201 });
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ success: false, message: "Grade level already exists" }, { status: 409 });
        }
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
