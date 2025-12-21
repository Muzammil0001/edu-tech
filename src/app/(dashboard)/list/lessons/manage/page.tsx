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
    name: z.string().min(2, { message: "Lesson name must be at least 2 characters." }),
    day: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"]),
    startTime: z.string(),
    endTime: z.string(),
    subjectId: z.string().min(1, { message: "Subject is required." }),
    classId: z.string().min(1, { message: "Class is required." }),
    teacherId: z.string().min(1, { message: "Teacher is required." }),
});

const LessonManagePage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const action = searchParams.get("action");
    const id = searchParams.get("id");
    const queryClient = useQueryClient();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            day: "MONDAY",
            startTime: "",
            endTime: "",
            subjectId: "",
            classId: "",
            teacherId: "",
        },
    });

    const { data: teachers } = useQuery({
        queryKey: ["teachers-minimal"],
        queryFn: async () => {
            try {
                const res = await axios.get("/api/teachers/getallteachers");
                return res.data.data;
            } catch (error: any) {
                toast.error("Failed to load teachers");
                return [];
            }
        },
    });

    const { data: subjects } = useQuery({
        queryKey: ["subjects"],
        queryFn: async () => {
            try {
                const res = await axios.get("/api/subjects/getallsubjects");
                return res.data.data;
            } catch (error: any) {
                toast.error("Failed to load subjects");
                return [];
            }
        },
    });

    const { data: classes } = useQuery({
        queryKey: ["classes"],
        queryFn: async () => {
            try {
                const res = await axios.get("/api/classes/getallclasses");
                return res.data.data;
            } catch (error: any) {
                toast.error("Failed to load classes");
                return [];
            }
        },
    });

    const { isLoading: lessonLoading } = useQuery({
        queryKey: ["lesson", id],
        queryFn: async () => {
            try {
                const res = await axios.get(`/api/lessons/getlesson/${id}`);
                const data = res.data.data;
                form.reset({
                    name: data.name,
                    day: data.day,
                    startTime: data.startTime.split('T')[1].substring(0, 5),
                    endTime: data.endTime.split('T')[1].substring(0, 5),
                    subjectId: data.subjectId.toString(),
                    classId: data.classId.toString(),
                    teacherId: data.teacherId,
                });
                return data;
            } catch (error: any) {
                toast.error("Failed to load lesson data");
                throw error;
            }
        },
        enabled: action === "edit" && !!id,
    });

    const mutation = useMutation({
        mutationFn: async (values: z.infer<typeof formSchema>) => {
            // Construct full ISO strings for startTime and endTime
            const today = new Date().toISOString().split('T')[0];
            const payload = {
                ...values,
                startTime: `${today}T${values.startTime}:00.000Z`,
                endTime: `${today}T${values.endTime}:00.000Z`,
            };
            if (action === "create") {
                return await axios.post("/api/lessons/create", payload);
            } else {
                return await axios.put(`/api/lessons/update/${id}`, payload);
            }
        },
        onSuccess: () => {
            toast.success(`Lesson ${action === "create" ? "created" : "updated"} successfully`);
            queryClient.invalidateQueries({ queryKey: ["lessons"] });
            router.push("/list/lessons");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Something went wrong during save");
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        mutation.mutate(values);
    }

    if (action === "edit" && lessonLoading) {
        return <div className="flex h-screen items-center justify-center"><Loader /></div>;
    }

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">{action === "create" ? "Add New Lesson" : "Edit Lesson"}</h1>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Lesson Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Math Theory" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="day"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Day</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a day" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"].map((day) => (
                                            <SelectItem key={day} value={day}>{day}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex gap-4">
                        <FormField
                            control={form.control}
                            name="startTime"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormLabel>Start Time</FormLabel>
                                    <FormControl>
                                        <Input type="time" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="endTime"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormLabel>End Time</FormLabel>
                                    <FormControl>
                                        <Input type="time" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="subjectId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Subject</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a subject" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {subjects?.map((sub: any) => (
                                            <SelectItem key={sub.id} value={sub.id.toString()}>{sub.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="classId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Class</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a class" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {classes?.map((cls: any) => (
                                            <SelectItem key={cls.id} value={cls.id.toString()}>{cls.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="teacherId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Teacher</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a teacher" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {teachers?.map((t: any) => (
                                            <SelectItem key={t.id} value={t.id}>{`${t.name} ${t.surname}`}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex gap-4">
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending ? "Saving..." : "Save Lesson"}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                    </div>
                </form>
            </Form>
        </div>
    );
};

export default LessonManagePage;
