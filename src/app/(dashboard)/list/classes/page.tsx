"use client";

import React, { useEffect, useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useClassColumns } from './column';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Loader from '@/components/ui/loader';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

const ClassList = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoaded } = useUser();
  const [mounted, setMounted] = useState(false);

  const supervisorId = searchParams.get("supervisorId");

  useEffect(() => {
    setMounted(true);
  }, []);

  const role = user?.publicMetadata?.role as string;
  const columns = useClassColumns(role);

  const { data: classes, isLoading } = useQuery({
    queryKey: ["classes", supervisorId],
    queryFn: async () => {
      const res = await axios.get("/api/classes/getallclasses");
      let data = res.data.data;

      if (supervisorId) {
        data = data.filter((item: any) => item.supervisorId === supervisorId);
      }

      return data;
    }
  });

  return (
    <div className="container mx-auto px-4 py-10">
      <div className='flex justify-between items-center mb-6'>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Classes</h1>
          {supervisorId && (
            <p className="text-sm text-muted-foreground">Showing classes supervised by selected teacher</p>
          )}
        </div>
        {mounted && isLoaded && role === "admin" && (
          <Button
            onClick={() => router.push("/list/classes/manage?action=create")}
            className='flex items-center gap-2'
          >
            <PlusCircle className="h-4 w-4" /> Register Class
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
          data={classes || []}
          filterableColumns={["name"]}
        />
      )}
    </div>
  );
};

export default ClassList;