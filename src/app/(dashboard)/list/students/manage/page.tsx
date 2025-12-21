"use client";

import React from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import {
    Form,
    FormField,
    FormItem,
    FormMessage,
    FormLabel,
    FormControl
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { CalendarIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, getMonth, getYear, setMonth, setYear } from "date-fns";
import { cn } from "@/lib/utils";
import Loader from "@/components/ui/loader";

const Schema = z.object({
    username: z.string().min(3).max(20),
    email: z.string().email(),
    password: z.string().min(8).optional().or(z.literal("")),
    firstname: z.string().min(3),
    lastname: z.string().min(3),
    phone: z.string().min(11),
    address: z.string().min(10),
    birthday: z.date(),
    sex: z.enum(["MALE", "FEMALE"]),
    bloodType: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]),
    parentId: z.string().min(1, "Parent is required"),
    classId: z.string().min(1, "Class is required"),
    gradeId: z.string().min(1, "Grade is required"),
});

type FormData = z.infer<typeof Schema>;

const ManageStudent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const action = searchParams.get("action") || "create";
    const id = searchParams.get("id");
    const queryClient = useQueryClient();
    const [date, setDate] = React.useState<Date>(new Date());

    const form = useForm<FormData>({
        resolver: zodResolver(Schema),
        defaultValues: {
            username: "", email: "", password: "", firstname: "", lastname: "", phone: "", address: "",
            sex: "" as any, bloodType: "" as any, parentId: "", classId: "", gradeId: ""
        }
    });

    const { data: parents, isLoading: parentsLoading } = useQuery({
        queryKey: ["parents"],
        queryFn: async () => {
            try {
                const res = await axios.get("/api/parents/getallparents");
                return res.data.data;
            } catch (error) {
                toast.error("Failed to load parents");
                return [];
            }
        }
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
        }
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
        }
    });

    const { isLoading: studentLoading } = useQuery({
        queryKey: ["student", id],
        queryFn: async () => {
            try {
                const res = await axios.get(`/api/students/getstudent/${id}`);
                const data = res.data.data;
                const birthday = data.birthday ? new Date(data.birthday) : new Date();
                form.reset({
                    username: data.username,
                    email: data.email,
                    firstname: data.name,
                    lastname: data.surname,
                    phone: data.phone,
                    address: data.address,
                    birthday: birthday,
                    sex: data.sex,
                    bloodType: data.bloodType,
                    parentId: data.parentId,
                    classId: String(data.classId),
                    gradeId: String(data.gradeId),
                    password: "",
                });
                setDate(birthday);
                return data;
            } catch (error) {
                toast.error("Failed to load student data");
                throw error;
            }
        },
        enabled: action === "edit" && !!id,
    });

    const studentMutation = useMutation({
        mutationFn: async (values: FormData) => {
            if (action === "create") return await axios.post("/api/students/create", values);
            return await axios.put(`/api/students/update/${id}`, values);
        },
        onSuccess: () => {
            toast.success(`Student ${action === "create" ? "created" : "updated"} successfully!`);
            router.push("/list/students");
            queryClient.invalidateQueries({ queryKey: ["students"] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Something went wrong during save");
        }
    });

    const onSubmit = (data: FormData) => studentMutation.mutate(data);

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const startYear = getYear(new Date()) - 100;
    const endYear = getYear(new Date()) + 10;
    const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);

    const handleMonthChange = (month: string) => setDate(setMonth(date, months.indexOf(month)));
    const handleYearChange = (year: string) => setDate(setYear(date, parseInt(year)));
    const handleSelectDate = (selectedData: Date | undefined) => {
        if (selectedData) { setDate(selectedData); form.setValue("birthday", selectedData); }
    };

    if (parentsLoading || classesLoading || gradesLoading || (action === "edit" && studentLoading)) {
        return <div className="flex h-screen items-center justify-center"><Loader /></div>;
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">{action === "create" ? "Add New Student" : "Edit Student"}</h1>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FormField control={form.control} name="firstname" render={({ field }) => (
                            <FormItem><FormLabel>First Name</FormLabel><FormControl><Input placeholder="John" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="lastname" render={({ field }) => (
                            <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input placeholder="Doe" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="username" render={({ field }) => (
                            <FormItem><FormLabel>Username</FormLabel><FormControl><Input placeholder="johndoe" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="email" render={({ field }) => (
                            <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="john@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="password" render={({ field }) => (
                            <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" placeholder={action === "edit" ? "Leave blank to keep current" : "*******"} {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="phone" render={({ field }) => (
                            <FormItem><FormLabel>Phone</FormLabel><FormControl><Input placeholder="+1234567890" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="address" render={({ field }) => (
                            <FormItem className="col-span-full"><FormLabel>Address</FormLabel><FormControl><Input placeholder="123 Street, City, Country" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />

                        <FormField control={form.control} name="parentId" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Parent</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select Parent" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {parents?.map((p: any) => (
                                            <SelectItem key={p.id} value={p.id}>{`${p.name} ${p.surname}`}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="classId" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Class</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select Class" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {classes?.map((c: any) => (
                                            <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="gradeId" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Grade</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select Grade" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {grades?.map((g: any) => (
                                            <SelectItem key={g.id} value={String(g.id)}>{g.level}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="birthday" render={() => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Birthday</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !form.watch("birthday") && "text-muted-foreground")}>
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {form.watch("birthday") ? format(form.watch("birthday"), "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <div className="flex gap-2 p-2">
                                            <Select onValueChange={handleMonthChange} value={months[getMonth(date)]}>
                                                <SelectTrigger className="w-[120px]"><SelectValue placeholder="Month" /></SelectTrigger>
                                                <SelectContent>{months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                                            </Select>
                                            <Select onValueChange={handleYearChange} value={getYear(date).toString()}>
                                                <SelectTrigger className="w-[100px]"><SelectValue placeholder="Year" /></SelectTrigger>
                                                <SelectContent>{years.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}</SelectContent>
                                            </Select>
                                        </div>
                                        <Calendar mode="single" selected={form.watch("birthday")} onSelect={handleSelectDate} initialFocus month={date} onMonthChange={setDate} />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="sex" render={({ field }) => (
                            <FormItem><FormLabel>Gender</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select Gender" /></SelectTrigger></FormControl>
                                    <SelectContent><SelectItem value="MALE">Male</SelectItem><SelectItem value="FEMALE">Female</SelectItem></SelectContent>
                                </Select><FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="bloodType" render={({ field }) => (
                            <FormItem><FormLabel>Blood Type</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select Blood Type" /></SelectTrigger></FormControl>
                                    <SelectContent>{["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                                </Select><FormMessage />
                            </FormItem>
                        )} />
                    </div>

                    <div className="flex gap-4">
                        <Button type="submit" disabled={studentMutation.isPending}>
                            {studentMutation.isPending ? "Saving..." : action === "create" ? "Create Student" : "Update Student"}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                    </div>
                </form>
            </Form>
        </div>
    );
};
export default ManageStudent;
