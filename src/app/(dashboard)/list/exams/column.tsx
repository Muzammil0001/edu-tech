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

export type Exam = {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  lesson: {
    name: string;
    subject: { name: string };
    class: { name: string };
  };
};

export const useExamColumns = (role?: string) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const columns: ColumnDef<Exam>[] = [
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
        <DataTableColumnHeader column={column} title="Exam Title" />
      ),
    },
    {
      accessorKey: "lesson",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Lesson / Subject" />
      ),
      cell: ({ row }) => {
        const l = row.original.lesson;
        return l ? `${l.name} (${l.subject?.name})` : "N/A";
      },
    },
    {
      accessorKey: "class",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Class" />
      ),
      cell: ({ row }) => row.original.lesson?.class?.name || "N/A",
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
    ...(role === "admin" || role === "teacher"
      ? [
        {
          id: "action",
          header: () => <div className="text-center">Action</div>,
          cell: ({ row }: { row: Row<Exam> }) => (
            <div className="flex items-center justify-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push(`/list/exams/manage?action=edit&id=${row.original.id}`)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <DeleteDialog
                trigger={
                  <Button variant="ghost" size="icon">
                    <Trash className="h-4 w-4 text-destructive" />
                  </Button>
                }
                title="Delete Exam"
                description="This action cannot be undone. This will permanently delete the exam and its associated results."
                onDelete={async () => {
                  try {
                    const res = await axios.delete(`/api/exams/delete/${row.original.id}`);
                    if (res.data.success) {
                      toast.success("Exam deleted successfully");
                      queryClient.invalidateQueries({ queryKey: ["exams"] });
                    } else {
                      toast.error(res.data.message || "Failed to delete exam");
                    }
                  } catch (error: any) {
                    const message = error.response?.data?.message || "Unable to delete exam due to dependencies (results, etc.)";
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
