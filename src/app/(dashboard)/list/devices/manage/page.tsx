"use client";

import React, { useEffect } from "react";
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
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import Loader from "@/components/ui/loader";

const Schema = z.object({
  name: z
    .string()
    .min(3, { message: "Device name must be at least 3 characters long" })
    .max(20, { message: "Device name must be at most 20 characters long" }),
  deviceId: z
    .string()
    .min(3, { message: "Device ID must be at least 3 characters long" }),
});

type FormData = z.infer<typeof Schema>;

const ManageDevice = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const action = searchParams.get("action") || "create";
  const id = searchParams.get("id");
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(Schema),
    defaultValues: {
      name: "",
      deviceId: "",
    },
  });

  const { isLoading: deviceLoading } = useQuery({
    queryKey: ["device", id],
    queryFn: async () => {
      try {
        const response = await axios.get(`/api/devices/getsingledevice/${id}`);
        const deviceData = response.data;
        form.reset({
          name: deviceData.name || "",
          deviceId: deviceData.deviceId || "",
        });
        return deviceData;
      } catch (error) {
        toast.error("Failed to load device data");
        throw error;
      }
    },
    enabled: action === "edit" && !!id,
  });

  const deviceMutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (action === "create") {
        return await axios.post("/api/devices/create", data);
      } else {
        return await axios.put(`/api/devices/update/${id}`, data);
      }
    },
    onSuccess: () => {
      toast.success(`Device ${action === "create" ? "created" : "updated"} successfully!`);
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      router.push("/list/devices");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Something went wrong during save");
    },
  });

  const onSubmit = (data: FormData) => {
    deviceMutation.mutate(data);
  };

  if (action === "edit" && deviceLoading) {
    return <div className="flex h-screen items-center justify-center"><Loader /></div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        {action === "create" ? "Create Device" : "Edit Device"}
      </h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Device Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Front Door Camera" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deviceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Device ID</FormLabel>
                  <FormControl>
                    <Input placeholder="DEV-001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={deviceMutation.isPending}
            >
              {deviceMutation.isPending ? "Saving..." : action === "create" ? "Create Device" : "Update Device"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ManageDevice;
