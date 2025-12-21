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
    name: z.string().min(2, { message: "Class name must be at least 2 characters." }),
    capacity: z.coerce.number().min(1, { message: "Capacity must be at least 1." }),
    gradeId: z.string().min(1, { message: "Grade is required." }),
    supervisorId: z.string().optional(),
});

const ClassManagePage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const action = searchParams.get("action");
    const id = searchParams.get("id");
    const queryClient = useQueryClient();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            capacity: 0,
            gradeId: "",
            supervisorId: "",
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

    const { data: grades, isLoading: gradesLoading } = useQuery({
        queryKey: ["grades"],
        queryFn: async () => {
            try {
                const res = await axios.get("/api/grades/getallgrades");
                return res.data.data;
            } catch (error) {
                toast.error("Failed to load grades");
                return [];
            }
        },
    });

    const { isLoading: classLoading } = useQuery({
        queryKey: ["class", id],
        queryFn: async () => {
            try {
                const res = await axios.get(`/api/classes/getclass/${id}`);
                const data = res.data.data;
                form.reset({
                    name: data.name,
                    capacity: data.capacity,
                    gradeId: data.gradeId.toString(),
                    supervisorId: data.supervisorId || "",
                });
                return data;
            } catch (error) {
                toast.error("Failed to load class data");
                throw error;
            }
        },
        enabled: action === "edit" && !!id,
    });

    const mutation = useMutation({
        mutationFn: async (values: z.infer<typeof formSchema>) => {
            const payload = {
                ...values,
                supervisorId: values.supervisorId === "none" ? null : values.supervisorId,
            };
            if (action === "create") {
                return await axios.post("/api/classes/create", payload);
            } else {
                return await axios.put(`/api/classes/update/${id}`, payload);
            }
        },
        onSuccess: () => {
            toast.success(`Class ${action === "create" ? "created" : "updated"} successfully`);
            queryClient.invalidateQueries({ queryKey: ["classes"] });
            router.push("/list/classes");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Something went wrong during save");
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        mutation.mutate(values);
    }

    if (teachersLoading || gradesLoading || (action === "edit" && classLoading)) {
        return <div className="flex h-screen items-center justify-center"><Loader /></div>;
    }

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">{action === "create" ? "Add New Class" : "Edit Class"}</h1>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Class Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="1A" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="capacity"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Capacity</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="gradeId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Grade</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a grade" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {grades?.map((grade: any) => (
                                            <SelectItem key={grade.id} value={grade.id.toString()}>
                                                Level {grade.level}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="supervisorId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Supervisor (Optional)</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a supervisor" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="none">None</SelectItem>
                                        {teachers?.map((teacher: any) => (
                                            <SelectItem key={teacher.id} value={teacher.id}>
                                                {`${teacher.name} ${teacher.surname}`}
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
                            {mutation.isPending ? "Saving..." : "Save Class"}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                    </div>
                </form>
            </Form>
        </div>
    );
};

export default ClassManagePage;
