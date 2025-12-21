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
    title: z.string().min(2, { message: "Exam title must be at least 2 characters." }),
    startTime: z.string(),
    endTime: z.string(),
    lessonId: z.string().min(1, { message: "Lesson is required." }),
});

const ExamManagePage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const action = searchParams.get("action");
    const id = searchParams.get("id");
    const queryClient = useQueryClient();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            startTime: "",
            endTime: "",
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

    const { isLoading: examLoading } = useQuery({
        queryKey: ["exam", id],
        queryFn: async () => {
            try {
                const res = await axios.get(`/api/exams/getexam/${id}`);
                const data = res.data.data;
                form.reset({
                    title: data.title,
                    startTime: data.startTime.substring(0, 16),
                    endTime: data.endTime.substring(0, 16),
                    lessonId: data.lessonId.toString(),
                });
                return data;
            } catch (error) {
                toast.error("Failed to load exam data");
                throw error;
            }
        },
        enabled: action === "edit" && !!id,
    });

    const mutation = useMutation({
        mutationFn: async (values: z.infer<typeof formSchema>) => {
            const payload = {
                ...values,
                startTime: new Date(values.startTime).toISOString(),
                endTime: new Date(values.endTime).toISOString(),
            };
            if (action === "create") {
                return await axios.post("/api/exams/create", payload);
            } else {
                return await axios.put(`/api/exams/update/${id}`, payload);
            }
        },
        onSuccess: () => {
            toast.success(`Exam ${action === "create" ? "created" : "updated"} successfully`);
            queryClient.invalidateQueries({ queryKey: ["exams"] });
            router.push("/list/exams");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Something went wrong during save");
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        mutation.mutate(values);
    }

    if ((action === "edit" && examLoading) || lessonsLoading) {
        return <div className="flex h-screen items-center justify-center"><Loader /></div>;
    }

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">{action === "create" ? "Add New Exam" : "Edit Exam"}</h1>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Exam Title</FormLabel>
                                <FormControl>
                                    <Input placeholder="Midterm Exam" {...field} />
                                </FormControl>
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
                                        <Input type="datetime-local" {...field} />
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
                                                {`${lesson.subject} - ${lesson.class}`}
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
                            {mutation.isPending ? "Saving..." : "Save Exam"}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                    </div>
                </form>
            </Form>
        </div>
    );
};

export default ExamManagePage;
