"use client";

import React, { useEffect, useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useAnnouncementColumns } from './column';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Loader from '@/components/ui/loader';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

const AnnouncementList = () => {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const role = user?.publicMetadata?.role as string;
  const columns = useAnnouncementColumns(role);

  const { data: announcements, isLoading } = useQuery({
    queryKey: ["announcements"],
    queryFn: async () => {
      const res = await axios.get("/api/announcements/getallannouncements");
      return res.data.data;
    }
  });

  return (
    <div className="container mx-auto px-4 py-10">
      <div className='flex justify-between items-center mb-6'>
        <h1 className="text-2xl font-bold tracking-tight">Announcements</h1>
        {mounted && isLoaded && role === "admin" && (
          <Button
            onClick={() => router.push("/list/announcements/manage?action=create")}
            className='flex items-center gap-2'
          >
            <PlusCircle className="h-4 w-4" /> Add Announcement
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
          data={announcements || []}
          filterableColumns={["title"]}
        />
      )}
    </div>
  );
};

export default AnnouncementList;
