"use client";

import React, { useEffect, useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useGradeColumns } from './column';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Loader from '@/components/ui/loader';
import { toast } from 'sonner';

const GradeList = () => {
    const { user, isLoaded } = useUser();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const role = user?.publicMetadata?.role as string | undefined;
    const columns = useGradeColumns(role);
    const router = useRouter();

    const { data: grades, isLoading } = useQuery({
        queryKey: ["grades"],
        queryFn: async () => {
            try {
                const res = await axios.get("/api/grades/getallgrades");
                return res.data.data;
            } catch (error: any) {
                toast.error(error.response?.data?.message || "Failed to fetch grades");
                throw error;
            }
        }
    });

    return (
        <div className="container mx-auto px-4 py-10">
            <div className='flex justify-between items-center mb-6'>
                <h1 className="text-2xl font-bold tracking-tight">Grades</h1>
                {mounted && isLoaded && role === "admin" && (
                    <Button
                        onClick={() => router.push("/list/grades/manage?action=create")}
                        className='flex items-center gap-2'
                    >
                        <PlusCircle className="h-4 w-4" /> Add New Grade
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
                    data={grades || []}
                    filterableColumns={["level"]}
                />
            )}
        </div>
    );
};

export default GradeList;
