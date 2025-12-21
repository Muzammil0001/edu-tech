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

export type Result = {
  id: number;
  score: number;
  exam?: { title: string; lesson: { subject: { name: string } } };
  assignment?: { title: string; lesson: { subject: { name: string } } };
  student: { name: string; surname: string };
};

export const useResultColumns = (role?: string) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const columns: ColumnDef<Result>[] = [
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
      accessorKey: "student",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Student" />
      ),
      cell: ({ row }) => {
        const s = row.original.student;
        return s ? `${s.name} ${s.surname}` : "N/A";
      },
    },
    {
      accessorKey: "type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type" />
      ),
      cell: ({ row }) => row.original.exam ? "Exam" : "Assignment",
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Exams / Assignment" />
      ),
      cell: ({ row }) => {
        const res = row.original;
        const info = res.exam || res.assignment;
        return info?.title || "N/A";
      },
    },
    {
      accessorKey: "subject",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Subject" />
      ),
      cell: ({ row }) => {
        const res = row.original;
        const info = res.exam || res.assignment;
        return info?.lesson?.subject?.name || "N/A";
      },
    },
    {
      accessorKey: "score",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Score" />
      ),
    },
    ...(role === "admin" || role === "teacher"
      ? [
        {
          id: "action",
          header: () => <div className="text-center">Action</div>,
          cell: ({ row }: { row: Row<Result> }) => (
            <div className="flex items-center justify-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push(`/list/results/manage?action=edit&id=${row.original.id}`)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <DeleteDialog
                trigger={
                  <Button variant="ghost" size="icon">
                    <Trash className="h-4 w-4 text-destructive" />
                  </Button>
                }
                title="Delete Result"
                description="This action cannot be undone."
                onDelete={async () => {
                  try {
                    const res = await axios.delete(`/api/results/delete/${row.original.id}`);
                    if (res.data.success) {
                      toast.success("Result deleted successfully");
                      queryClient.invalidateQueries({ queryKey: ["results"] });
                    } else {
                      toast.error(res.data.message || "Failed to delete result");
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
