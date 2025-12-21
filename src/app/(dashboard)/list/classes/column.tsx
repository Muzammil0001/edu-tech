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

export type Class = {
  id: number;
  name: string;
  capacity: number;
  grade: {
    id: number;
    level: number;
  };
  supervisor: {
    id: string;
    name: string;
    surname: string;
  };
};

export const useClassColumns = (role?: string) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const columns: ColumnDef<Class>[] = [
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
        <DataTableColumnHeader column={column} title="Name" />
      ),
    },
    {
      accessorKey: "capacity",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Capacity" />
      ),
    },
    {
      accessorKey: "grade",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Grade" />
      ),
      cell: ({ row }) => row.original.grade?.level || "N/A",
    },
    {
      accessorKey: "supervisor",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Supervisor" />
      ),
      cell: ({ row }) => {
        const s = row.original.supervisor;
        return s ? `${s.name} ${s.surname}` : "N/A";
      },
    },
    ...(role === "admin"
      ? [
        {
          id: "action",
          header: () => <div className="text-center">Action</div>,
          cell: ({ row }: { row: Row<Class> }) => (
            <div className="flex items-center justify-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push(`/list/classes/manage?action=edit&id=${row.original.id}`)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <DeleteDialog
                trigger={
                  <Button variant="ghost" size="icon">
                    <Trash className="h-4 w-4 text-destructive" />
                  </Button>
                }
                title="Delete Class"
                description="This action cannot be undone. This will permanently delete the class and all associated data if there are no dependencies."
                onDelete={async () => {
                  try {
                    const res = await axios.delete(`/api/classes/delete/${row.original.id}`);
                    if (res.data.success) {
                      toast.success("Class deleted successfully");
                      queryClient.invalidateQueries({ queryKey: ["classes"] });
                    } else {
                      toast.error(res.data.message || "Failed to delete class");
                    }
                  } catch (error: any) {
                    const message = error.response?.data?.message || "Unable to delete class due to existing dependencies (lessons, students, etc.)";
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
