"use client";

import { ColumnDef, Row } from "@tanstack/react-table";
import { Edit, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/DataTableColumnHeaderProps";
import { Checkbox } from "@/components/ui/checkbox";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import axios from "axios";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

export type Event = {
  id: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  class?: { name: string };
};

export const useEventColumns = (role?: string) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const columns: ColumnDef<Event>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Event Title" />
      ),
    },
    {
      accessorKey: "class",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Class" />
      ),
      cell: ({ row }) => row.original.class?.name || "All Classes",
    },
    {
      accessorKey: "startTime",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Start Time" />
      ),
      cell: ({ row }) => format(new Date(row.original.startTime), "PPp"),
    },
    {
      accessorKey: "endTime",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="End Time" />
      ),
      cell: ({ row }) => format(new Date(row.original.endTime), "PPp"),
    },
    ...(role === "admin"
      ? [
        {
          id: "action",
          header: () => <div className="text-center">Action</div>,
          cell: ({ row }: { row: Row<Event> }) => (
            <div className="flex items-center justify-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push(`/list/events/manage?action=edit&id=${row.original.id}`)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <DeleteDialog
                trigger={
                  <Button variant="ghost" size="icon">
                    <Trash className="h-4 w-4 text-destructive" />
                  </Button>
                }
                title="Delete Event"
                description="This action cannot be undone."
                onDelete={async () => {
                  try {
                    const res = await axios.delete(`/api/events/delete/${row.original.id}`);
                    if (res.data.success) {
                      toast.success("Event deleted successfully");
                      queryClient.invalidateQueries({ queryKey: ["events"] });
                    } else {
                      toast.error(res.data.message || "Failed to delete event");
                    }
                  } catch (error: any) {
                    toast.error("An error occurred during deletion");
                  }
                }}
              />
            </div>
          ),
        },
      ]
      : []),
  ];

  return columns;
};
