"use client";

import React, { useEffect, useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useStudentColumns } from './columns';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Loader from '@/components/ui/loader';
import { toast } from 'sonner';

const StudentList = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  const teacherId = searchParams.get("teacherId");

  useEffect(() => {
    setMounted(true);
  }, []);

  const role = user?.publicMetadata.role as string | undefined;
  const columns = useStudentColumns(role);

  const { data: students, isLoading } = useQuery({
    queryKey: ["students", teacherId],
    queryFn: async () => {
      try {
        const res = await axios.get("/api/students/getallstudents");
        let data = res.data.data;

        if (teacherId) {
          // Filter students who are in classes supervised by this teacher
          data = data.filter((s: any) => s.class?.supervisorId === teacherId);
        }

        return data;
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to fetch students");
        throw error;
      }
    }
  });

  return (
    <div className="container mx-auto px-4 py-10">
      <div className='flex justify-between items-center mb-6'>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Students</h1>
          {teacherId && (
            <p className="text-sm text-muted-foreground">Showing students in classes supervised by selected teacher</p>
          )}
        </div>
        {mounted && isLoaded && role === "admin" && (
          <Button
            onClick={() => router.push("/list/students/manage?action=create")}
            className='flex items-center gap-2'
          >
            <PlusCircle className="h-4 w-4" /> Register Student
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
          data={students || []}
          filterableColumns={["username", "email", "phone"]}
        />
      )}
    </div>
  );
};

export default StudentList;
