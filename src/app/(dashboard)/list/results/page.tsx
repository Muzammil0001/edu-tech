"use client";

import React, { useEffect, useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useResultColumns } from './column';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Loader from '@/components/ui/loader';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

const ResultList = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoaded } = useUser();
  const [mounted, setMounted] = useState(false);

  const studentId = searchParams.get("studentId");

  useEffect(() => {
    setMounted(true);
  }, []);

  const role = user?.publicMetadata?.role as string;
  const columns = useResultColumns(role);

  const { data: results, isLoading } = useQuery({
    queryKey: ["results", studentId],
    queryFn: async () => {
      const res = await axios.get("/api/results/getallresults");
      let data = res.data.data;

      if (studentId) {
        data = data.filter((item: any) => item.studentId === studentId);
      }

      return data;
    }
  });

  return (
    <div className="container mx-auto px-4 py-10">
      <div className='flex justify-between items-center mb-6'>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Results</h1>
          {studentId && (
            <p className="text-sm text-muted-foreground">Showing results for selected student</p>
          )}
        </div>
        {mounted && isLoaded && (role === "admin" || role === "teacher") && (
          <Button
            onClick={() => router.push("/list/results/manage?action=create")}
            className='flex items-center gap-2'
          >
            <PlusCircle className="h-4 w-4" /> Add New Result
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
          data={results || []}
          filterableColumns={["student"]}
        />
      )}
    </div>
  );
};

export default ResultList;