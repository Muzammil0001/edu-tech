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

export type Lesson = {
  id: number;
  name: string;
  day: string;
  startTime: string;
  endTime: string;
  subject: { name: string };
  class: { name: string };
  teacher: { name: string; surname: string };
};

export const useLessonColumns = (role?: string) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const columns: ColumnDef<Lesson>[] = [
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
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Lesson Name" />
      ),
    },
    {
      accessorKey: "subject",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Subject" />
      ),
      cell: ({ row }) => row.original.subject?.name || "N/A",
    },
    {
      accessorKey: "class",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Class" />
      ),
      cell: ({ row }) => row.original.class?.name || "N/A",
    },
    {
      accessorKey: "teacher",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Teacher" />
      ),
      cell: ({ row }) => {
        const t = row.original.teacher;
        return t ? `${t.name} ${t.surname}` : "N/A";
      },
    },
    {
      accessorKey: "day",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Day" />
      ),
    },
    {
      accessorKey: "startTime",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Start Time" />
      ),
    },
    {
      accessorKey: "endTime",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="End Time" />
      ),
    },
    ...(role === "admin" || role === "teacher"
      ? [
        {
          id: "action",
          header: () => <div className="text-center">Action</div>,
          cell: ({ row }: { row: Row<Lesson> }) => (
            <div className="flex items-center justify-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push(`/list/lessons/manage?action=edit&id=${row.original.id}`)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <DeleteDialog
                trigger={
                  <Button variant="ghost" size="icon">
                    <Trash className="h-4 w-4 text-destructive" />
                  </Button>
                }
                title="Delete Lesson"
                description="This action cannot be undone. This will permanently delete the lesson."
                onDelete={async () => {
                  try {
                    const res = await axios.delete(`/api/lessons/delete/${row.original.id}`);
                    if (res.data.success) {
                      toast.success("Lesson deleted successfully");
                      queryClient.invalidateQueries({ queryKey: ["lessons"] });
                    } else {
                      toast.error(res.data.message || "Failed to delete lesson");
                    }
                  } catch (error: any) {
                    const message = error.response?.data?.message || "Unable to delete lesson due to existing dependencies (exams, assignments, etc.)";
                    toast.error(message);
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
