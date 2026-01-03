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
    title: z.string().min(2, { message: "Assignment title must be at least 2 characters." }),
    startDate: z.string(),
    dueDate: z.string(),
    lessonId: z.string().min(1, { message: "Lesson is required." }),
});

const AssignmentManagePage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const action = searchParams.get("action");
    const id = searchParams.get("id");
    const queryClient = useQueryClient();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            startDate: "",
            dueDate: "",
            lessonId: "",
        },
    });

    const { data: lessons, isLoading: lessonsLoading } = useQuery({
        queryKey: ["lessons-all"],
        queryFn: async () => {
            try {
                const res = await axios.get("/api/lessons/getalllessons");
                return res.data.data;
            } catch (error) {
                toast.error("Failed to load lessons");
                return [];
            }
        },
    });

    const { isLoading: assignmentLoading } = useQuery({
        queryKey: ["assignment", id],
        queryFn: async () => {
            try {
                const res = await axios.get(`/api/assignments/getassignment/${id}`);
                const data = res.data.data;
                form.reset({
                    title: data.title,
                    startDate: data.startDate.substring(0, 16),
                    dueDate: data.dueDate.substring(0, 16),
                    lessonId: data.lessonId.toString(),
                });
                return data;
            } catch (error) {
                toast.error("Failed to load assignment data");
                throw error;
            }
        },
        enabled: action === "edit" && !!id,
    });

    const mutation = useMutation({
        mutationFn: async (values: z.infer<typeof formSchema>) => {
            const payload = {
                ...values,
                startDate: new Date(values.startDate).toISOString(),
                dueDate: new Date(values.dueDate).toISOString(),
            };
            if (action === "create") {
                return await axios.post("/api/assignments/create", payload);
            } else {
                return await axios.put(`/api/assignments/update/${id}`, payload);
            }
        },
        onSuccess: () => {
            toast.success(`Assignment ${action === "create" ? "created" : "updated"} successfully`);
            queryClient.invalidateQueries({ queryKey: ["assignments"] });
            router.push("/list/assignments");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Something went wrong during save");
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        mutation.mutate(values);
    }

    if (lessonsLoading || (action === "edit" && assignmentLoading)) {
        return <div className="flex h-screen items-center justify-center"><Loader /></div>;
    }

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">{action === "create" ? "Add New Assignment" : "Edit Assignment"}</h1>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Assignment Title</FormLabel>
                                <FormControl>
                                    <Input placeholder="Chapter 1 Exercises" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex gap-4">
                        <FormField
                            control={form.control}
                            name="startDate"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormLabel>Start Date</FormLabel>
                                    <FormControl>
                                        <Input type="datetime-local" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="dueDate"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormLabel>Due Date</FormLabel>
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
                        name="lessonId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Lesson</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a lesson" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {lessons?.map((lesson: any) => (
                                            <SelectItem key={lesson.id} value={lesson.id.toString()}>
                                                {lesson.name} ({lesson.subject?.name}) - {lesson.class?.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex gap-4">
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending ? "Saving..." : "Save Assignment"}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                    </div>
                </form>
            </Form>
        </div>
    );
};

export default AssignmentManagePage;
