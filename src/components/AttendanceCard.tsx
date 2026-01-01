"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';
import { Loader2, LogIn, LogOut, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

type AttendanceStatus = 'not-marked' | 'checked-in' | 'completed' | 'loading';

const AttendanceCard = () => {
    const queryClient = useQueryClient();

    const { data: attendanceData, isLoading } = useQuery({
        queryKey: ['my-attendance-today'],
        queryFn: async () => {
            const res = await axios.get('/api/attendance/dashboard');
            return res.data;
        },
        refetchInterval: 60000, // Refresh every minute
    });

    const status: AttendanceStatus = attendanceData?.status || 'not-marked';

    const mutation = useMutation({
        mutationFn: async () => {
            const res = await axios.post('/api/attendance/dashboard');
            return res.data;
        },
        onSuccess: (data) => {
            toast.success(data.message);
            queryClient.invalidateQueries({ queryKey: ['my-attendance-today'] });
        },
        onError: () => {
            toast.error("Failed to update attendance");
        }
    });

    const handleAction = () => {
        mutation.mutate();
    };

    const getStatusColor = (s: AttendanceStatus) => {
        switch (s) {
            case 'checked-in': return 'bg-green-100 text-green-700 border-green-200';
            case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusText = (s: AttendanceStatus) => {
        switch (s) {
            case 'checked-in': return 'Checked In';
            case 'completed': return 'Day Completed';
            case 'not-marked': return 'Not Checked In';
            default: return '...';
        }
    };

    if (isLoading) {
        return (
            <Card className="rounded-2xl p-4 flex items-center justify-center min-h-[150px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </Card>
        );
    }

    return (
        <Card className="bg-white rounded-2xl p-4 h-full flex flex-col justify-between">
            <CardHeader className="p-0 pb-4">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-xl font-semibold text-gray-800">Attendance</CardTitle>
                        <CardDescription className="text-sm text-gray-500 mt-1">
                            {format(new Date(), "EEEE, d MMMM")}
                        </CardDescription>
                    </div>
                    <Badge variant="outline" className={`${getStatusColor(status)} px-3 py-1`}>
                        {getStatusText(status)}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="flex flex-col gap-4">
                    {status === 'checked-in' && attendanceData?.data?.checkIn && (
                        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded-md">
                            Checked in at: <span className="font-semibold">{format(new Date(attendanceData.data.checkIn), "h:mm a")}</span>
                        </div>
                    )}
                    {status === 'completed' && attendanceData?.data?.checkIn && attendanceData?.data?.checkOut && (
                        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded-md space-y-1">
                            <div className="flex justify-between"><span>In:</span> <span className="font-semibold">{format(new Date(attendanceData.data.checkIn), "h:mm a")}</span></div>
                            <div className="flex justify-between"><span>Out:</span> <span className="font-semibold">{format(new Date(attendanceData.data.checkOut), "h:mm a")}</span></div>
                        </div>
                    )}

                    <Button
                        onClick={handleAction}
                        disabled={mutation.isPending || status === 'completed'}
                        className={`w-full ${status === 'checked-in' ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
                        size="lg"
                    >
                        {mutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : status === 'not-marked' ? (
                            <>
                                <LogIn className="mr-2 h-4 w-4" /> Check In
                            </>
                        ) : status === 'checked-in' ? (
                            <>
                                <LogOut className="mr-2 h-4 w-4" /> Check Out
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="mr-2 h-4 w-4" /> Completed
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default AttendanceCard;
