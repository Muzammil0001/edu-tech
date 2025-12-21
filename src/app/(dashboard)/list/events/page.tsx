"use client";

import React, { useEffect, useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useEventColumns } from './column';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Loader from '@/components/ui/loader';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

const EventList = () => {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const role = user?.publicMetadata?.role as string;
  const columns = useEventColumns(role);

  const { data: events, isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const res = await axios.get("/api/events/getallevents");
      return res.data.data;
    }
  });

  return (
    <div className="container mx-auto px-4 py-10">
      <div className='flex justify-between items-center mb-6'>
        <h1 className="text-2xl font-bold tracking-tight">Events</h1>
        {mounted && isLoaded && role === "admin" && (
          <Button
            onClick={() => router.push("/list/events/manage?action=create")}
            className='flex items-center gap-2'
          >
            <PlusCircle className="h-4 w-4" /> Add Event
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
          data={events || []}
          filterableColumns={["title"]}
        />
      )}
    </div>
  );
};

export default EventList;
