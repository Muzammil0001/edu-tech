"use client";

import React, { useEffect, useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useExamColumns } from './column';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Loader from '@/components/ui/loader';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

const ExamList = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoaded } = useUser();
  const [mounted, setMounted] = useState(false);

  const teacherId = searchParams.get("teacherId");
  const classId = searchParams.get("classId");

  useEffect(() => {
    setMounted(true);
  }, []);

  const role = user?.publicMetadata?.role as string;
  const columns = useExamColumns(role);

  const { data: exams, isLoading } = useQuery({
    queryKey: ["exams", teacherId, classId],
    queryFn: async () => {
      const res = await axios.get("/api/exams/getallexams");
      let data = res.data.data;

      if (teacherId) {
        data = data.filter((item: any) => item.lesson?.teacherId === teacherId);
      }
      if (classId) {
        data = data.filter((item: any) => item.lesson?.classId === parseInt(classId));
      }

      return data;
    }
  });

  return (
    <div className="container mx-auto px-4 py-10">
      <div className='flex justify-between items-center mb-6'>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Exams</h1>
          {(teacherId || classId) && (
            <p className="text-sm text-muted-foreground">Showing filtered results</p>
          )}
        </div>
        {mounted && isLoaded && (role === "admin" || role === "teacher") && (
          <Button
            onClick={() => router.push("/list/exams/manage?action=create")}
            className='flex items-center gap-2'
          >
            <PlusCircle className="h-4 w-4" /> Add New Exam
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
          data={exams || []}
          filterableColumns={["title"]}
        />
      )}
    </div>
  );
};

export default ExamList;