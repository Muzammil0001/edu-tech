import prisma from "../src/lib/prisma";
import { createClerkClient } from "@clerk/backend";
import { Day, UserSex } from "@prisma/client";

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

const adminUsername = "admin";
const adminEmail = `${adminUsername}@example.com`;
const adminPassword = "Admin@1234";

async function main() {
    // Ordered deletion to avoid foreign key constraints
    await prisma.attendance.deleteMany();
    await prisma.result.deleteMany();
    await prisma.exam.deleteMany();
    await prisma.assignment.deleteMany();
    await prisma.lesson.deleteMany();
    await prisma.announcement.deleteMany();
    await prisma.event.deleteMany();
    await prisma.student.deleteMany();
    await prisma.parent.deleteMany();
    await prisma.class.deleteMany();
    await prisma.subject.deleteMany();
    await prisma.teacher.deleteMany();
    await prisma.grade.deleteMany();
    await prisma.device.deleteMany();
    // Note: Not deleting Admin to avoid re-creation issues if not intended, 
    // but the following logic handles existing admins anyway.


    // 1. Grades
    const grades = [];
    for (let i = 1; i <= 6; i++) {
        const grade = await prisma.grade.create({
            data: { level: i },
        });
        grades.push(grade);
    }

    // 2. Subjects
    const subjectsList = [
        { name: "Mathematics" },
        { name: "Science" },
        { name: "English" },
        { name: "History" },
        { name: "Geography" },
        { name: "Physics" },
        { name: "Chemistry" },
        { name: "Computer Science" },
    ];
    const createdSubjects = [];
    for (const sub of subjectsList) {
        const s = await prisma.subject.create({ data: sub });
        createdSubjects.push(s);
    }

    // 3. Teachers
    const teachers = [];
    for (let i = 1; i <= 8; i++) {
        const t = await prisma.teacher.create({
            data: {
                id: `clerk_teacher_${i}`,
                username: `teacher${i}`,
                name: `TeacherName${i}`,
                surname: `Surname${i}`,
                email: `teacher${i}@school.com`,
                phone: `987654321${i}`,
                address: `Teacher St ${i}`,
                bloodType: "A+",
                sex: i % 2 === 0 ? UserSex.MALE : UserSex.FEMALE,
                birthday: new Date(1980 + i, i % 12, 1),
                password: "password123", // Mock password
                subjects: {
                    connect: [{ id: createdSubjects[i - 1]?.id || createdSubjects[0].id }]
                }
            },
        });
        teachers.push(t);
    }

    // 4. Classes (with Supervisors)
    const classes = [];
    const classNames = ["1A", "1B", "2A", "2B", "3A"];
    for (let i = 0; i < 5; i++) {
        const c = await prisma.class.create({
            data: {
                name: classNames[i],
                capacity: 25,
                gradeId: grades[Math.floor(i / 2)].id,
                supervisorId: teachers[i].id,
            },
        });
        classes.push(c);
    }

    // 5. Parents and Students
    for (let i = 1; i <= 10; i++) {
        const parent = await prisma.parent.create({
            data: {
                id: `clerk_parent_${i}`,
                username: `parent${i}`,
                name: `ParentName${i}`,
                surname: `Surname${i}`,
                email: `parent${i}@example.com`,
                phone: `5551234${i}`,
                address: `Parent Road ${i}`,
            }
        });

        await prisma.student.create({
            data: {
                id: `clerk_student_${i}`,
                username: `student${i}`,
                name: `StudentName${i}`,
                surname: `Surname${i}`,
                address: `Student Path ${i}`,
                bloodType: "O+",
                sex: i % 2 === 0 ? UserSex.FEMALE : UserSex.MALE,
                birthday: new Date(2010 + (i % 5), i % 12, 1),
                parentId: parent.id,
                classId: classes[i % 5].id,
                gradeId: classes[i % 5].gradeId,
            }
        });
    }

    // 6. Lessons
    const days = [Day.MONDAY, Day.TUESDAY, Day.WEDNESDAY, Day.THURSDAY, Day.FRIDAY];
    for (let i = 0; i < 15; i++) {
        await prisma.lesson.create({
            data: {
                name: `Lesson ${i + 1}`,
                day: days[i % 5],
                startTime: new Date(new Date().setHours(8 + (i % 5), 0, 0, 0)),
                endTime: new Date(new Date().setHours(10 + (i % 5), 0, 0, 0)),
                subjectId: createdSubjects[i % 8].id,
                classId: classes[i % 5].id,
                teacherId: teachers[i % 8].id,
            }
        });
    }

    // 7. Devices
    await prisma.device.create({
        data: {
            deviceId: "MAIN-GATE",
            name: "Main Entrance",
        }
    });

    // 8. Events and Announcements
    for (let i = 1; i <= 5; i++) {
        await prisma.event.create({
            data: {
                title: `School Event ${i}`,
                description: `Description for event ${i}`,
                startTime: new Date(Date.now() + i * 86400000),
                endTime: new Date(Date.now() + i * 86400000 + 3600000),
                classId: i % 2 === 0 ? classes[0].id : null,
            }
        });
        await prisma.announcement.create({
            data: {
                title: `News ${i}`,
                description: `Important update #${i}`,
                date: new Date(),
                classId: i % 2 === 0 ? classes[1].id : null,
            }
        });
    }

    console.log("✅ Seed data generated successfully");

    // 9. Admin Setup
    if (!process.env.CLERK_SECRET_KEY) {
        console.warn("⚠️ Skipping Clerk seeding: CLERK_SECRET_KEY not found in environment variables");
    } else {
        try {
            const usersByEmail = await clerkClient.users.getUserList({
                emailAddress: [adminEmail],
            });

            const usersByUsername = await clerkClient.users.getUserList({
                username: [adminUsername],
            });

            let clerkUser;

            if (usersByEmail.data.length > 0) {
                clerkUser = usersByEmail.data[0];
            } else if (usersByUsername.data.length > 0) {
                clerkUser = usersByUsername.data[0];
            }

            if (!clerkUser) {
                // Create Clerk user with public metadata
                clerkUser = await clerkClient.users.createUser({
                    username: adminUsername,
                    password: adminPassword,
                    emailAddress: [adminEmail],
                    publicMetadata: { role: "admin" },
                });

                console.log("✅ Admin created in Clerk with metadata:", clerkUser.publicMetadata);
            } else {
                console.log("✅ Admin already exists in Clerk");

                // Ensure metadata is set if the user already exists
                await clerkClient.users.updateUser(clerkUser.id, {
                    publicMetadata: { role: "admin" },
                    password: adminPassword,
                });

                console.log("✅ Updated Clerk user metadata and password for role: admin");
            }

            // Step 2: Ensure admin exists in Postgres using Prisma
            const existingAdminByUsername = await prisma.admin.findUnique({
                where: { username: adminUsername },
            });

            if (existingAdminByUsername) {
                await prisma.admin.update({
                    where: { username: adminUsername },
                    data: { id: clerkUser.id },
                });

                console.log("✅ Existing admin updated with Clerk ID");
            } else {
                await prisma.admin.create({
                    data: {
                        id: clerkUser.id,
                        username: adminUsername,
                    },
                });

                console.log("✅ Admin created in Postgres");
            }
        } catch (error) {
            console.error("❌ Clerk seeding failed:", error);
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
