import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const user = await currentUser();

        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const role = user.publicMetadata.role as string;
        if (role !== "student") {
            return new NextResponse("Only students can check in via this method", { status: 403 });
        }

        const student = await prisma.student.findUnique({
            where: { id: user.id },
        });

        if (!student) {
            return new NextResponse("Student record not found", { status: 404 });
        }

        // Find or Create a default device for web check-ins
        let device = await prisma.device.findFirst({
            where: { deviceId: "WEB-PORTAL" },
        });

        if (!device) {
            device = await prisma.device.create({
                data: {
                    deviceId: "WEB-PORTAL",
                    name: "Web Student Portal",
                }
            });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const existingAttendance = await prisma.attendance.findFirst({
            where: {
                studentId: student.id,
                date: {
                    gte: today,
                    lt: tomorrow,
                },
            },
        });

        if (existingAttendance) {
            if (existingAttendance.checkOut) {
                return NextResponse.json({
                    message: "You have already checked out for today.",
                    status: "completed",
                    data: existingAttendance
                });
            } else {
                // Perform Check-out
                const updated = await prisma.attendance.update({
                    where: { id: existingAttendance.id },
                    data: { checkOut: new Date() },
                });
                return NextResponse.json({
                    message: "Checked out successfully",
                    status: "checked-out",
                    data: updated
                });
            }
        } else {
            // Perform Check-in
            const newAttendance = await prisma.attendance.create({
                data: {
                    date: new Date(),
                    checkIn: new Date(),
                    studentId: student.id,
                    deviceId: device.id,
                },
            });
            return NextResponse.json({
                message: "Checked in successfully",
                status: "checked-in",
                data: newAttendance
            });
        }

    } catch (error) {
        console.error("Attendance API Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const user = await currentUser();

        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const attendance = await prisma.attendance.findFirst({
            where: {
                studentId: user.id,
                date: {
                    gte: today,
                    lt: tomorrow,
                },
            },
        });

        let status = "not-marked";
        if (attendance) {
            if (attendance.checkOut) {
                status = "completed";
            } else {
                status = "checked-in";
            }
        }

        return NextResponse.json({
            status,
            data: attendance
        });

    } catch (error) {
        console.error("Attendance Fetch Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
