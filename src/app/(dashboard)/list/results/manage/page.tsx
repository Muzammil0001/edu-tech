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
    score: z.coerce.number().min(0),
    studentId: z.string().min(1, { message: "Student is required." }),
    examId: z.string().optional(),
    assignmentId: z.string().optional(),
});

const ResultManagePage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const action = searchParams.get("action");
    const id = searchParams.get("id");
    const queryClient = useQueryClient();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            score: 0,
            studentId: "",
            examId: "",
            assignmentId: "",
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

    const { data: exams, isLoading: examsLoading } = useQuery({
        queryKey: ["exams-all"],
        queryFn: async () => {
            try {
                const res = await axios.get("/api/exams/getallexams");
                return res.data.data;
            } catch (error) {
                toast.error("Failed to load exams");
                return [];
            }
        },
    });

    const { data: assignments, isLoading: assignmentsLoading } = useQuery({
        queryKey: ["assignments-all"],
        queryFn: async () => {
            try {
                const res = await axios.get("/api/assignments/getallassignments");
                return res.data.data;
            } catch (error) {
                toast.error("Failed to load assignments");
                return [];
            }
        },
    });

    const { isLoading: resultLoading } = useQuery({
        queryKey: ["result", id],
        queryFn: async () => {
            try {
                const res = await axios.get(`/api/results/getresult/${id}`);
                const data = res.data.data;
                form.reset({
                    score: data.score,
                    studentId: data.studentId,
                    examId: data.examId?.toString() || "",
                    assignmentId: data.assignmentId?.toString() || "",
                });
                return data;
            } catch (error) {
                toast.error("Failed to load result data");
                throw error;
            }
        },
        enabled: action === "edit" && !!id,
    });

    const mutation = useMutation({
        mutationFn: async (values: z.infer<typeof formSchema>) => {
            const payload = {
                ...values,
                examId: values.examId && values.examId !== "none" ? parseInt(values.examId) : undefined,
                assignmentId: values.assignmentId && values.assignmentId !== "none" ? parseInt(values.assignmentId) : undefined,
            };
            if (action === "create") {
                return await axios.post("/api/results/create", payload);
            } else {
                return await axios.put(`/api/results/update/${id}`, payload);
            }
        },
        onSuccess: () => {
            toast.success(`Result ${action === "create" ? "created" : "updated"} successfully`);
            queryClient.invalidateQueries({ queryKey: ["results"] });
            router.push("/list/results");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Something went wrong during save");
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        mutation.mutate(values);
    }

    if (studentsLoading || examsLoading || assignmentsLoading || (action === "edit" && resultLoading)) {
        return <div className="flex h-screen items-center justify-center"><Loader /></div>;
    }

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">{action === "create" ? "Add New Result" : "Edit Result"}</h1>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="score"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Score</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

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
                                            <SelectItem key={student.id} value={student.id}>
                                                {`${student.name} ${student.surname}`}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="text-sm font-medium text-muted-foreground">Select either an Exam or an Assignment:</div>

                    <FormField
                        control={form.control}
                        name="examId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Exam (Optional)</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select an exam" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="none">None</SelectItem>
                                        {exams?.map((exam: any) => (
                                            <SelectItem key={exam.id} value={exam.id.toString()}>
                                                {exam.title} ({exam.lesson?.subject?.name})
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
                        name="assignmentId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Assignment (Optional)</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select an assignment" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="none">None</SelectItem>
                                        {assignments?.map((assignment: any) => (
                                            <SelectItem key={assignment.id} value={assignment.id.toString()}>
                                                {assignment.title} ({assignment.lesson?.subject?.name})
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
                            {mutation.isPending ? "Saving..." : "Save Result"}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                    </div>
                </form>
            </Form>
        </div>
    );
};

export default ResultManagePage;
