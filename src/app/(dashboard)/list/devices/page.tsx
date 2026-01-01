"use client";
import React, { useEffect, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDeviceColumns } from "./columns";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@clerk/nextjs";
import Loader from "@/components/ui/loader";

const DevicesList = () => {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const role = user?.publicMetadata?.role as string | undefined;
  const columns = useDeviceColumns(role);

  const fetchDevices = async () => {
    const response = await axios.get("/api/devices/getalldevices");
    return response.data;
  };

  const {
    data: devices,
    isLoading,
  } = useQuery({
    queryKey: ["devices"],
    queryFn: fetchDevices,
  });

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Devices</h1>
        {mounted && isLoaded && role === "admin" && (
          <Button
            className="flex items-center gap-2"
            onClick={() => router.push("/list/devices/manage?action=create")}
          >
            <PlusCircle className="h-4 w-4" /> Register Device
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={devices || []}
          filterableColumns={["name", "deviceId"]}
        />
      )}
    </div>
  );
};

export default DevicesList;

