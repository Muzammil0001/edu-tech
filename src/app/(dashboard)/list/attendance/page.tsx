"use client";

import React, { useEffect, useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useAttendanceColumns } from './column';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Loader from '@/components/ui/loader';
import { toast } from 'sonner';

const AttendanceList = () => {
    const { user, isLoaded } = useUser();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const role = user?.publicMetadata.role as string | undefined;
    const columns = useAttendanceColumns(role);
    const router = useRouter();

    const { data: attendance, isLoading } = useQuery({
        queryKey: ["attendance"],
        queryFn: async () => {
            try {
                const res = await axios.get("/api/attendance/getallattendance");
                return res.data.data;
            } catch (error: any) {
                toast.error(error.response?.data?.message || "Failed to fetch attendance");
                throw error;
            }
        }
    });

    return (
        <div className="container mx-auto px-4 py-10">
            <div className='flex justify-between items-center mb-6'>
                <h1 className="text-2xl font-bold tracking-tight">Attendance</h1>
                {mounted && isLoaded && role === "admin" && (
                    <Button
                        onClick={() => router.push("/list/attendance/manage?action=create")}
                        className='flex items-center gap-2'
                    >
                        <PlusCircle className="h-4 w-4" /> Log Attendance
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
                    data={attendance || []}
                    filterableColumns={["student", "class", "device"]}
                />
            )}
        </div>
    );
};

export default AttendanceList;
