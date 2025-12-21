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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import Loader from "@/components/ui/loader";
import React from "react";

const formSchema = z.object({
    name: z.string().min(2, { message: "Subject name must be at least 2 characters." }),
    teacherIds: z.array(z.string()).optional(),
});

const SubjectManagePage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const action = searchParams.get("action");
    const id = searchParams.get("id");
    const queryClient = useQueryClient();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            teacherIds: [],
        },
    });

    const { data: teachers, isLoading: teachersLoading } = useQuery({
        queryKey: ["teachers-minimal"],
        queryFn: async () => {
            try {
                const res = await axios.get("/api/teachers/getallteachers");
                return res.data.data;
            } catch (error) {
                toast.error("Failed to load teachers");
                return [];
            }
        },
    });

    const { isLoading: subjectLoading } = useQuery({
        queryKey: ["subject", id],
        queryFn: async () => {
            try {
                const res = await axios.get(`/api/subjects/getsubject/${id}`);
                const data = res.data.data;
                form.reset({
                    name: data.name,
                    teacherIds: data.teachers.map((t: any) => t.id),
                });
                return data;
            } catch (error) {
                toast.error("Failed to load subject data");
                throw error;
            }
        },
        enabled: action === "edit" && !!id,
    });

    const mutation = useMutation({
        mutationFn: async (values: z.infer<typeof formSchema>) => {
            if (action === "create") {
                return await axios.post("/api/subjects/create", values);
            } else {
                return await axios.put(`/api/subjects/update/${id}`, values);
            }
        },
        onSuccess: () => {
            toast.success(`Subject ${action === "create" ? "created" : "updated"} successfully`);
            queryClient.invalidateQueries({ queryKey: ["subjects"] });
            router.push("/list/subjects");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Something went wrong during save");
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        mutation.mutate(values);
    }

    if (teachersLoading || (action === "edit" && subjectLoading)) {
        return <div className="flex h-screen items-center justify-center"><Loader /></div>;
    }

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">{action === "create" ? "Add New Subject" : "Edit Subject"}</h1>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Subject Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Mathematics" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="teacherIds"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Teachers</FormLabel>
                                <FormControl>
                                    <div className="grid grid-cols-2 gap-2 border p-4 rounded-md overflow-y-auto max-h-40">
                                        {teachers?.map((teacher: any) => (
                                            <label key={teacher.id} className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    checked={field.value?.includes(teacher.id)}
                                                    onChange={(e) => {
                                                        const newValue = e.target.checked
                                                            ? [...(field.value || []), teacher.id]
                                                            : field.value?.filter((val) => val !== teacher.id);
                                                        field.onChange(newValue);
                                                    }}
                                                />
                                                <span className="text-sm">{teacher.name} {teacher.surname}</span>
                                            </label>
                                        ))}
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex gap-4">
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending ? "Saving..." : "Save Subject"}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                    </div>
                </form>
            </Form>
        </div>
    );
};

export default SubjectManagePage;
