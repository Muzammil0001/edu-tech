import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const attendance = await prisma.attendance.findMany({
            include: {
                student: {
                    include: {
                        class: true,
                    }
                },
                device: true,
            },
        });

        const formattedAttendance = attendance.map((att) => ({
            ...att,
            student: att.student.name + " " + att.student.surname,
            class: att.student.class.name,
            device: att.device.name,
        }));

        return NextResponse.json({ success: true, data: formattedAttendance });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
