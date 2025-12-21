import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { date, checkIn, checkOut, studentId, deviceId } = body;

        const attendance = await prisma.attendance.create({
            data: {
                date: new Date(date),
                checkIn: new Date(checkIn),
                checkOut: checkOut ? new Date(checkOut) : null,
                studentId,
                deviceId: parseInt(deviceId),
            },
        });

        return NextResponse.json({ success: true, data: attendance }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
