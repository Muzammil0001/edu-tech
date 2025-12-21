"use client";

import React, { useEffect, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTeacherColumns } from "./columns";
import axios from "axios";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import Loader from "@/components/ui/loader";
import { useUser } from "@clerk/nextjs";

const TeacherList = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoaded } = useUser();
  const [mounted, setMounted] = useState(false);

  const classId = searchParams.get("classId");

  useEffect(() => {
    setMounted(true);
  }, []);

  const role = user?.publicMetadata?.role as string | undefined;
  const columns = useTeacherColumns(role);

  const {
    data: teachers,
    isLoading,
  } = useQuery({
    queryKey: ["teachers", classId],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/teachers/getallteachers");
        let data = response.data.data;

        if (classId) {
          // Filter teachers who teach a lesson in this class
          // We need to check if the teacher has any lesson with classId
          data = data.filter((t: any) => t.lessons?.some((l: any) => l.classId === parseInt(classId)));
        }

        return data;
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to fetch teachers");
        throw error;
      }
    },
  });

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Teachers</h1>
          {classId && (
            <p className="text-sm text-muted-foreground">Showing teachers for selected class</p>
          )}
        </div>
        {mounted && isLoaded && role === "admin" && (
          <Button
            onClick={() => router.push("/list/teachers/manage?action=create")}
            className='flex items-center gap-2'
          >
            <PlusCircle className="h-4 w-4" /> Register Teacher
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={teachers || []}
          filterableColumns={["username", "email", "phone"]}
        />
      )}
    </div>
  );
};

export default TeacherList;
