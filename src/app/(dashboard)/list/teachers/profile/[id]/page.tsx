"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Calendar, Droplet, Mail, Phone, Presentation, Shapes, UserRoundCheck } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useParams } from "next/navigation";
import Loader from "@/components/ui/loader";
import { format } from "date-fns";

const SingleTeacherPage = () => {
  const { id } = useParams();

  const { data: teacher, isLoading } = useQuery({
    queryKey: ["teacher", id],
    queryFn: async () => {
      const res = await axios.get(`/api/teachers/getteacher/${id}`);
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

  if (!teacher) {
    return (
      <div className="flex h-screen items-center justify-center">
        Teacher not found
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
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${teacher.username}`}
                    alt={teacher.name}
                  />
                  <AvatarFallback>{teacher.name.charAt(0)}{teacher.surname.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>
              <div className="w-full md:w-2/3 flex flex-col justify-between gap-4 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-4">
                  <h1 className="text-xl font-semibold ">{teacher.name} {teacher.surname}</h1>
                  <Badge variant="outline" className="capitalize">{teacher.sex.toLowerCase()}</Badge>
                </div>
                <p className="text-sm text-gray-500">
                  {teacher.address || "No address provided."}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium">
                  <div className="flex items-center gap-2">
                    <Droplet className="w-4 h-4 text-primary" />
                    <span>{teacher.bloodType || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>Joined {format(new Date(teacher.createdAt), "MMMM yyyy")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" />
                    <span className="truncate">{teacher.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-primary" />
                    <span>{teacher.phone || "N/A"}</span>
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
                <h1 className="text-xl font-semibold">90%</h1>
                <span className="text-sm text-gray-400">Attendance</span>
              </div>
            </Card>
            {/* CARD */}
            <Card className="w-full sm:w-[48%] p-4 flex items-center gap-4">
              <Shapes className="h-6 w-6 text-purple-500" />
              <div>
                <h1 className="text-xl font-semibold">{teacher.subjects?.length || 0}</h1>
                <span className="text-sm text-gray-400">Subjects</span>
              </div>
            </Card>
            {/* CARD */}
            <Card className="w-full sm:w-[48%] p-4 flex items-center gap-4">
              <Presentation className="h-6 w-6 text-yellow-500" />
              <div>
                <h1 className="text-xl font-semibold">{teacher.lessons?.length || 0}</h1>
                <span className="text-sm text-gray-400">Lessons</span>
              </div>
            </Card>
            {/* CARD */}
            <Card className="w-full sm:w-[48%] p-4 flex items-center gap-4">
              <Shapes className="h-6 w-6 text-pink-500" />
              <div>
                <h1 className="text-xl font-semibold">{teacher.classes?.length || 0}</h1>
                <span className="text-sm text-gray-400">Classes</span>
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
              <Link href={`/list/classes?supervisorId=${teacher.id}`}>
                <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-white transition-colors">Teacher&apos;s Classes</Badge>
              </Link>
              <Link href={`/list/students?teacherId=${teacher.id}`}>
                <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-white transition-colors">Teacher&apos;s Students</Badge>
              </Link>
              <Link href={`/list/lessons?teacherId=${teacher.id}`}>
                <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-white transition-colors">Teacher&apos;s Lessons</Badge>
              </Link>
              <Link href={`/list/exams?teacherId=${teacher.id}`}>
                <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-white transition-colors">Teacher&apos;s Exams</Badge>
              </Link>
              <Link href={`/list/assignments?teacherId=${teacher.id}`}>
                <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-white transition-colors">Teacher&apos;s Assignments</Badge>
              </Link>
            </div>
          </Card>
        </div>
        {/* Removed dummy Performance and Announcements */}
      </div>
    </div>
  );
};

export default SingleTeacherPage;
