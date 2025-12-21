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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import Loader from "@/components/ui/loader";
import React from "react";

const formSchema = z.object({
    title: z.string().min(2, { message: "Title must be at least 2 characters." }),
    description: z.string().min(5, { message: "Description must be at least 5 characters." }),
    startTime: z.string(),
    endTime: z.string(),
    classId: z.string().optional(),
});

const EventManagePage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const action = searchParams.get("action");
    const id = searchParams.get("id");
    const queryClient = useQueryClient();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            startTime: "",
            endTime: "",
            classId: "",
        },
    });

    const { data: classes, isLoading: classesLoading } = useQuery({
        queryKey: ["classes"],
        queryFn: async () => {
            try {
                const res = await axios.get("/api/classes/getallclasses");
                return res.data.data;
            } catch (error) {
                toast.error("Failed to load classes");
                return [];
            }
        },
    });

    const { isLoading: eventLoading } = useQuery({
        queryKey: ["event", id],
        queryFn: async () => {
            try {
                const res = await axios.get(`/api/events/getevent/${id}`);
                const data = res.data.data;
                form.reset({
                    title: data.title,
                    description: data.description,
                    startTime: data.startTime.substring(0, 16),
                    endTime: data.endTime.substring(0, 16),
                    classId: data.classId?.toString() || "",
                });
                return data;
            } catch (error) {
                toast.error("Failed to load event data");
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
                classId: values.classId && values.classId !== "all" ? parseInt(values.classId) : null,
            };
            if (action === "create") {
                return await axios.post("/api/events/create", payload);
            } else {
                return await axios.put(`/api/events/update/${id}`, payload);
            }
        },
        onSuccess: () => {
            toast.success(`Event ${action === "create" ? "created" : "updated"} successfully`);
            queryClient.invalidateQueries({ queryKey: ["events"] });
            router.push("/list/events");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Something went wrong during save");
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        mutation.mutate(values);
    }

    if (classesLoading || (action === "edit" && eventLoading)) {
        return <div className="flex h-screen items-center justify-center"><Loader /></div>;
    }

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">{action === "create" ? "Add New Event" : "Edit Event"}</h1>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Title</FormLabel>
                                <FormControl>
                                    <Input placeholder="Annual Sports Day" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Details about the event..." {...field} />
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
                        name="classId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Target Class (Optional)</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All Classes" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="all">All Classes</SelectItem>
                                        {classes?.map((cls: any) => (
                                            <SelectItem key={cls.id} value={cls.id.toString()}>{cls.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex gap-4">
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending ? "Saving..." : "Save Event"}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                    </div>
                </form>
            </Form>
        </div>
    );
};

export default EventManagePage;
