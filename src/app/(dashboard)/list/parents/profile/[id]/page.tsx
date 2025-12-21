"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Calendar, Mail, Phone, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useParams } from "next/navigation";
import Loader from "@/components/ui/loader";
import { format } from "date-fns";
import Link from "next/link";

const SingleParentPage = () => {
    const { id } = useParams();

    const { data: parent, isLoading } = useQuery({
        queryKey: ["parent", id],
        queryFn: async () => {
            const res = await axios.get(`/api/parents/getparent/${id}`);
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

    if (!parent) {
        return (
            <div className="flex h-screen items-center justify-center">
                Parent not found
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
                                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${parent.username}`}
                                        alt={parent.name}
                                    />
                                    <AvatarFallback>{parent.name.charAt(0)}{parent.surname.charAt(0)}</AvatarFallback>
                                </Avatar>
                            </div>
                            <div className="w-full md:w-2/3 flex flex-col justify-between gap-4 text-center md:text-left">
                                <div className="flex items-center justify-center md:justify-start gap-4">
                                    <h1 className="text-xl font-semibold ">{parent.name} {parent.surname}</h1>
                                </div>
                                <p className="text-sm text-gray-500">
                                    {parent.address || "No address provided."}
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-primary" />
                                        <span>Joined {format(new Date(parent.createdAt), "MMMM yyyy")}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-primary" />
                                        <span className="truncate">{parent.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-primary" />
                                        <span>{parent.phone || "N/A"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                    {/* SMALL CARDS */}
                    <div className="flex-1 flex gap-4 justify-between flex-wrap">
                        {/* CARD */}
                        <Card className="w-full sm:w-[48%] p-4 flex items-center gap-4 text-purple-500">
                            <User className="h-6 w-6" />
                            <div>
                                <h1 className="text-xl font-semibold">{parent.students?.length || 0}</h1>
                                <span className="text-sm text-gray-400">Students</span>
                            </div>
                        </Card>
                        {/* CARD */}
                        <div className="w-full sm:w-[48%] flex flex-col gap-2">
                            {parent.students?.map((student: any) => (
                                <Card key={student.id} className="p-3 flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <Avatar className="w-8 h-8">
                                            <AvatarFallback>{student.name[0]}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">{student.name} {student.surname}</p>
                                            <p className="text-xs text-muted-foreground">{student.class?.name || "No Class"}</p>
                                        </div>
                                    </div>
                                    <Link href={`/list/students/profile/${student.id}`}>
                                        <Badge variant="secondary" className="hover:bg-primary hover:text-white transition-colors">View</Badge>
                                    </Link>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
                {/* BOTTOM */}
                {/* Removed dummy Performance and Announcements */}
            </div>
            {/* RIGHT */}
            <div className="w-full xl:w-1/3 flex flex-col gap-4">
                {/* Removed dummy Performance */}
            </div>
        </div>
    );
};

export default SingleParentPage;
