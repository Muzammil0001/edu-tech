import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { users } from "@clerk/clerk-sdk-node";

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const body = await req.json();
        const {
            username,
            email,
            password,
            firstname,
            lastname,
            phone,
            address,
        } = body;

        // Update Clerk fields if provided
        const clerkUpdates: any = {};
        if (password) clerkUpdates.password = password;
        if (username) clerkUpdates.username = username;
        // Updating email in Clerk is more complex (verification), skipping for simple update

        if (Object.keys(clerkUpdates).length > 0) {
            await users.updateUser(id, clerkUpdates);
        }

        const parent = await prisma.parent.update({
            where: { id },
            data: {
                username,
                email,
                phone,
                address,
                name: firstname,
                surname: lastname,
            },
        });

        return NextResponse.json({ success: true, data: parent });

    } catch (error: any) {
        console.error("[PARENT_UPDATE_ERROR]", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
