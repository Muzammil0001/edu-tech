import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { users } from "@clerk/clerk-sdk-node";

export async function POST(req: Request) {
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

        const role = "parent";

        // ✅ Password validation (based on Clerk requirements)
        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/;
        if (!passwordRegex.test(password)) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Password must be at least 8 characters long and include at least one lowercase letter, one uppercase letter, one number, and one special character.",
                },
                { status: 400 }
            );
        }

        // ✅ Unique field checks in Prisma
        const existingParent = await prisma.parent.findFirst({
            where: {
                OR: [
                    { username },
                    { email: email ?? undefined },
                    { phone },
                ],
            },
        });

        if (existingParent) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "A parent with the same username, email, or phone already exists.",
                },
                { status: 409 }
            );
        }

        // ✅ Check Clerk for existing user
        const existingClerkUsers = await users.getUserList({
            emailAddress: [email],
        });

        let clerkUser;
        if (existingClerkUsers.length === 0) {
            clerkUser = await users.createUser({
                username,
                password,
                emailAddress: [email],
                publicMetadata: { role },
            });
            console.log("✅ Parent created in Clerk with metadata:", clerkUser.publicMetadata);
        } else {
            clerkUser = existingClerkUsers[0];
            // Ensure metadata is set
            await users.updateUser(clerkUser.id, {
                publicMetadata: { role },
            });
        }

        // ✅ Create parent in DB
        const parent = await prisma.parent.create({
            data: {
                id: clerkUser.id,
                username,
                email,
                phone,
                address,
                name: firstname,
                surname: lastname,
            },
        });

        return NextResponse.json({ success: true, data: parent }, { status: 201 });
    } catch (error: any) {
        console.error("[PARENT_POST_ERROR]", error);
        return NextResponse.json(
            {
                success: false,
                message: error?.message || "Something went wrong",
                errors: error?.errors || [],
            },
            { status: error?.status || 500 }
        );
    }
}
