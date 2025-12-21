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
    FormControl,
    FormMessage,
    FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Loader from "@/components/ui/loader";

const Schema = z.object({
    username: z
        .string()
        .min(3, { message: "Username must be at least 3 characters long" })
        .max(20, { message: "Username must be at most 20 characters long" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z
        .string()
        .min(8, { message: "Password must be at least 8 characters long" })
        .optional()
        .or(z.literal("")),
    firstname: z
        .string()
        .min(3, { message: "First name must be at least 3 characters long" }),
    lastname: z
        .string()
        .min(3, { message: "Last name must be at least 3 characters long" }),
    phone: z
        .string()
        .min(11, { message: "Phone number must be at least 11 characters long" }),
    address: z
        .string()
        .min(10, { message: "Address must be at least 10 characters long" }),
});

type FormData = z.infer<typeof Schema>;

const ManageParent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const action = searchParams.get("action") || "create";
    const id = searchParams.get("id");
    const queryClient = useQueryClient();

    const form = useForm<FormData>({
        resolver: zodResolver(Schema),
        defaultValues: {
            username: "",
            email: "",
            password: "",
            firstname: "",
            lastname: "",
            phone: "",
            address: "",
        },
    });

    const { isLoading: parentLoading } = useQuery({
        queryKey: ["parent", id],
        queryFn: async () => {
            try {
                const response = await axios.get(`/api/parents/getparent/${id}`);
                const parentData = response.data.data;
                form.reset({
                    username: parentData.username || "",
                    firstname: parentData.name || "",
                    lastname: parentData.surname || "",
                    email: parentData.email || "",
                    phone: parentData.phone || "",
                    address: parentData.address || "",
                    password: "",
                });
                return parentData;
            } catch (error) {
                toast.error("Failed to load parent data");
                throw error;
            }
        },
        enabled: action === "edit" && !!id,
    });

    const parentMutation = useMutation({
        mutationFn: async (values: FormData) => {
            if (action === "create") {
                return await axios.post("/api/parents/create", values);
            } else {
                return await axios.put(`/api/parents/update/${id}`, values);
            }
        },
        onSuccess: () => {
            toast.success(`Parent ${action === "create" ? "created" : "updated"} successfully!`);
            queryClient.invalidateQueries({ queryKey: ["parents"] });
            router.push("/list/parents");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Something went wrong during save");
        },
    });

    const onSubmit = (data: FormData) => {
        parentMutation.mutate(data);
    };

    if (action === "edit" && parentLoading) {
        return <div className="flex h-screen items-center justify-center"><Loader /></div>;
    }

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">
                {action === "create" ? "Add New Parent" : "Edit Parent"}
            </h1>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FormField
                            control={form.control}
                            name="firstname"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>First Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Jane" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="lastname"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Last Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Smith" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                        <Input placeholder="janesmith" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="jane@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder={action === "edit" ? "Leave blank to keep current" : "*******"} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone</FormLabel>
                                    <FormControl>
                                        <Input placeholder="+1234567890" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem className="col-span-full">
                                    <FormLabel>Address</FormLabel>
                                    <FormControl>
                                        <Input placeholder="123 Street, City, Country" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="flex gap-4">
                        <Button type="submit" disabled={parentMutation.isPending}>
                            {parentMutation.isPending ? "Saving..." : action === "create" ? "Create Parent" : "Update Parent"}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                    </div>
                </form>
            </Form>
        </div>
    );
};

export default ManageParent;
