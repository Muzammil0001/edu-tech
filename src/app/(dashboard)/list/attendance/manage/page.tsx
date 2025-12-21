"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import Loader from "@/components/ui/loader";
import React from "react";

const formSchema = z.object({
    date: z.string(),
    checkIn: z.string(),
    checkOut: z.string().optional(),
    studentId: z.string().min(1, { message: "Student is required." }),
    deviceId: z.string().min(1, { message: "Device is required." }),
});

const AttendanceManagePage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const action = searchParams.get("action");
    const id = searchParams.get("id");
    const queryClient = useQueryClient();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            date: new Date().toISOString().substring(0, 10),
            checkIn: "",
            checkOut: "",
            studentId: "",
            deviceId: "",
        },
    });

    const { data: students, isLoading: studentsLoading } = useQuery({
        queryKey: ["students-minimal"],
        queryFn: async () => {
            try {
                const res = await axios.get("/api/students/getallstudents");
                return res.data.data;
            } catch (error) {
                toast.error("Failed to load students");
                return [];
            }
        },
    });

    const { data: devices, isLoading: devicesLoading } = useQuery({
        queryKey: ["devices"],
        queryFn: async () => {
            try {
                const res = await axios.get("/api/devices/getalldevices");
                return res.data.data;
            } catch (error) {
                toast.error("Failed to load devices");
                return [];
            }
        },
    });

    const { isLoading: attendanceLoading } = useQuery({
        queryKey: ["attendance-item", id],
        queryFn: async () => {
            try {
                const res = await axios.get(`/api/attendance/getattendance/${id}`);
                const data = res.data.data;
                form.reset({
                    date: data.date.substring(0, 10),
                    checkIn: data.checkIn.substring(0, 16),
                    checkOut: data.checkOut ? data.checkOut.substring(0, 16) : "",
                    studentId: data.studentId,
                    deviceId: data.deviceId.toString(),
                });
                return data;
            } catch (error) {
                toast.error("Failed to load attendance data");
                throw error;
            }
        },
        enabled: action === "edit" && !!id,
    });

    const mutation = useMutation({
        mutationFn: async (values: z.infer<typeof formSchema>) => {
            const payload = {
                ...values,
                date: new Date(values.date).toISOString(),
                checkIn: new Date(values.checkIn).toISOString(),
                checkOut: values.checkOut ? new Date(values.checkOut).toISOString() : null,
            };
            if (action === "create") {
                return await axios.post("/api/attendance/create", payload);
            } else {
                return await axios.put(`/api/attendance/update/${id}`, payload);
            }
        },
        onSuccess: () => {
            toast.success(`Attendance ${action === "create" ? "created" : "updated"} successfully`);
            queryClient.invalidateQueries({ queryKey: ["attendance"] });
            router.push("/list/attendance");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Something went wrong during save");
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        mutation.mutate(values);
    }

    if (studentsLoading || devicesLoading || (action === "edit" && attendanceLoading)) {
        return <div className="flex h-screen items-center justify-center"><Loader /></div>;
    }

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">{action === "create" ? "Log Attendance" : "Edit Attendance"}</h1>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Date</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex gap-4">
                        <FormField
                            control={form.control}
                            name="checkIn"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormLabel>Check In Time</FormLabel>
                                    <FormControl>
                                        <Input type="datetime-local" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="checkOut"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormLabel>Check Out Time (Optional)</FormLabel>
                                    <FormControl>
                                        <Input type="datetime-local" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="studentId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Student</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a student" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {students?.map((student: any) => (
                                            <SelectItem key={student.id} value={student.id}>{`${student.name} ${student.surname}`}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="deviceId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Device</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a device" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {devices?.map((dev: any) => (
                                            <SelectItem key={dev.id} value={dev.id.toString()}>{dev.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex gap-4">
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending ? "Saving..." : "Save Attendance"}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                    </div>
                </form>
            </Form>
        </div>
    );
};

export default AttendanceManagePage;
