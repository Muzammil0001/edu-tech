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

export type Assignment = {
  id: number;
  title: string;
  dueDate: string;
  lesson: {
    name: string;
    subject: { name: string };
    class: { name: string };
  };
};

export const useAssignmentColumns = (role?: string) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const columns: ColumnDef<Assignment>[] = [
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
        <DataTableColumnHeader column={column} title="Assignment Title" />
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
      accessorKey: "dueDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Due Date" />
      ),
      cell: ({ row }) => format(new Date(row.original.dueDate), "PPp"),
    },
    ...(role === "admin" || role === "teacher"
      ? [
        {
          id: "action",
          header: () => <div className="text-center">Action</div>,
          cell: ({ row }: { row: Row<Assignment> }) => (
            <div className="flex items-center justify-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push(`/list/assignments/manage?action=edit&id=${row.original.id}`)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <DeleteDialog
                trigger={
                  <Button variant="ghost" size="icon">
                    <Trash className="h-4 w-4 text-destructive" />
                  </Button>
                }
                title="Delete Assignment"
                description="This action cannot be undone. This will permanently delete the assignment and its associated submissions/results."
                onDelete={async () => {
                  try {
                    const res = await axios.delete(`/api/assignments/delete/${row.original.id}`);
                    if (res.data.success) {
                      toast.success("Assignment deleted successfully");
                      queryClient.invalidateQueries({ queryKey: ["assignments"] });
                    } else {
                      toast.error(res.data.message || "Failed to delete assignment");
                    }
                  } catch (error: any) {
                    const message = error.response?.data?.message || "Unable to delete assignment due to dependencies.";
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
