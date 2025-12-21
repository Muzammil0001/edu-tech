"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Calendar, Droplet, Mail, Phone, Presentation, Shapes, UserRoundCheck, User } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useParams } from "next/navigation";
import Loader from "@/components/ui/loader";
import { format } from "date-fns";

const StudentProfilePage = () => {
    const { id } = useParams();

    const { data: student, isLoading } = useQuery({
        queryKey: ["student", id],
        queryFn: async () => {
            const res = await axios.get(`/api/students/getstudent/${id}`);
            return res.data.data;
        },
        enabled: !!id,
    });

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader />
            </div>
        );
    }

    if (!student) {
        return (
            <div className="flex h-screen items-center justify-center">
                Student not found
            </div>
        );
    }

    return (
        <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
            {/* LEFT */}
            <div className="w-full xl:w-2/3">
                {/* TOP */}
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* USER INFO CARD */}
                    <Card className="flex-1">
                        <div className="py-6 px-4 rounded-md flex flex-col md:flex-row items-center gap-4">
                            <div className="w-full md:w-1/3 flex justify-center items-center">
                                <Avatar className="w-32 h-32 md:w-40 md:h-40">
                                    <AvatarImage
                                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.username}`}
                                        alt={student.name}
                                    />
                                    <AvatarFallback>{student.name.charAt(0)}{student.surname.charAt(0)}</AvatarFallback>
                                </Avatar>
                            </div>
                            <div className="w-full md:w-2/3 flex flex-col justify-between gap-4 text-center md:text-left">
                                <div className="flex items-center justify-center md:justify-start gap-4">
                                    <h1 className="text-xl font-semibold ">{student.name} {student.surname}</h1>
                                    <Badge variant="outline" className="capitalize">{student.sex.toLowerCase()}</Badge>
                                </div>
                                <p className="text-sm text-gray-500">
                                    {student.address || "No address provided."}
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium">
                                    <div className="flex items-center gap-2">
                                        <Droplet className="w-4 h-4 text-primary" />
                                        <span>{student.bloodType || "N/A"}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-primary" />
                                        <span>Born {format(new Date(student.birthday), "PPP")}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-primary" />
                                        <span className="truncate">{student.email || "No email"}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-primary" />
                                        <span>{student.phone || "N/A"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                    {/* SMALL CARDS */}
                    <div className="flex-1 flex gap-4 justify-between flex-wrap">
                        {/* CARD */}
                        <Card className="w-full sm:w-[48%] p-4 flex items-center gap-4">
                            <UserRoundCheck className="h-6 w-6 text-blue-500" />
                            <div>
                                <h1 className="text-xl font-semibold">95%</h1>
                                <span className="text-sm text-gray-400">Attendance</span>
                            </div>
                        </Card>
                        {/* CARD */}
                        <Card className="w-full sm:w-[48%] p-4 flex items-center gap-4">
                            <Presentation className="h-6 w-6 text-purple-500" />
                            <div>
                                <h1 className="text-xl font-semibold">{student.grade?.level || "N/A"}</h1>
                                <span className="text-sm text-gray-400">Grade</span>
                            </div>
                        </Card>
                        {/* CARD */}
                        <Card className="w-full sm:w-[48%] p-4 flex items-center gap-4">
                            <Shapes className="h-6 w-6 text-yellow-500" />
                            <div>
                                <h1 className="text-xl font-semibold">{student.class?.name || "N/A"}</h1>
                                <span className="text-sm text-gray-400">Class</span>
                            </div>
                        </Card>
                        {/* CARD */}
                        <Card className="w-full sm:w-[48%] p-4 flex items-center gap-4 text-pink-500">
                            <User className="h-6 w-6" />
                            <div>
                                <h1 className="text-lg font-semibold truncate max-w-[120px]">
                                    {student.parent ? `${student.parent.name} ${student.parent.surname}` : "N/A"}
                                </h1>
                                <span className="text-sm text-gray-400">Parent</span>
                            </div>
                        </Card>
                    </div>
                </div>
                {/* BOTTOM */}
                {/* Removed dummy BigCalendar */}
            </div>
            {/* RIGHT */}
            <div className="w-full xl:w-1/3 flex flex-col gap-4">
                <div>
                    <h1 className="text-xl font-semibold mb-2">Shortcuts</h1>
                    <Card className="p-4">
                        <div className="flex gap-2 flex-wrap text-xs">
                            <Link href={`/list/lessons?classId=${student.classId}`}>
                                <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-white transition-colors">Student&apos;s Lessons</Badge>
                            </Link>
                            <Link href={`/list/teachers?classId=${student.classId}`}>
                                <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-white transition-colors">Student&apos;s Teachers</Badge>
                            </Link>
                            <Link href={`/list/exams?classId=${student.classId}`}>
                                <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-white transition-colors">Student&apos;s Exams</Badge>
                            </Link>
                            <Link href={`/list/assignments?classId=${student.classId}`}>
                                <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-white transition-colors">Student&apos;s Assignments</Badge>
                            </Link>
                            <Link href={`/list/results?studentId=${student.id}`}>
                                <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-white transition-colors">Student&apos;s Results</Badge>
                            </Link>
                        </div>
                    </Card>
                </div>
                {/* Removed dummy Performance and Announcements */}
            </div>
        </div>
    );
};

export default StudentProfilePage;
