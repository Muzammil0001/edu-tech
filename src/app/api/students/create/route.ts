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
            birthday,
            sex,
            bloodType,
            parentId,
            classId,
            gradeId
        } = body;

        const role = "student";

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/;
        if (!passwordRegex.test(password)) {
            return NextResponse.json(
                { success: false, message: "Password complexity not met." },
                { status: 400 }
            );
        }

        const existingStudent = await prisma.student.findFirst({
            where: {
                OR: [
                    { username },
                    { email: email ?? undefined },
                    { phone: phone ?? undefined },
                ],
            },
        });

        if (existingStudent) {
            return NextResponse.json(
                { success: false, message: "Student already exists (username, email, or phone)." },
                { status: 409 }
            );
        }

        const existingClerkUsers = await users.getUserList({ emailAddress: [email] });
        let clerkUser;

        if (existingClerkUsers.length === 0) {
            clerkUser = await users.createUser({
                username,
                password,
                emailAddress: [email],
                publicMetadata: { role },
            });
        } else {
            clerkUser = existingClerkUsers[0];
            await users.updateUser(clerkUser.id, { publicMetadata: { role } });
        }

        const student = await prisma.student.create({
            data: {
                id: clerkUser.id,
                username,
                email,
                phone,
                address,
                birthday: new Date(birthday),
                sex: sex as any,
                bloodType,
                name: firstname,
                surname: lastname,
                parentId,
                classId: parseInt(classId),
                gradeId: parseInt(gradeId),
            },
        });

        return NextResponse.json({ success: true, data: student }, { status: 201 });
    } catch (error: any) {
        console.error("[STUDENT_POST_ERROR]", error);
        return NextResponse.json(
            { success: false, message: error?.message || "Something went wrong", errors: error?.errors || [] },
            { status: error?.status || 500 }
        );
    }
}
