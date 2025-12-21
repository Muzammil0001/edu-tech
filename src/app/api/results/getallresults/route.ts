import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const results = await prisma.result.findMany({
            include: {
                student: true,
                exam: {
                    include: {
                        lesson: {
                            include: {
                                subject: true,
                                class: true,
                            }
                        }
                    }
                },
                assignment: {
                    include: {
                        lesson: {
                            include: {
                                subject: true,
                                class: true,
                            }
                        }
                    }
                },
            },
        });

        return NextResponse.json({ success: true, data: results });
    } catch (error: any) {
        console.error("[GET_RESULTS_ERROR]", error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
