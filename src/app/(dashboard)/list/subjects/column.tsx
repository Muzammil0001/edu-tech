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

export type Subject = {
  id: number;
  name: string;
  teachers: { name: string, surname: string }[];
};

export const useSubjectColumns = (role?: string) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const columns: ColumnDef<Subject>[] = [
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
        <DataTableColumnHeader column={column} title="Subject Name" />
      ),
    },
    {
      accessorKey: "teachers",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Teachers" />
      ),
      cell: ({ row }) => {
        const teachers = row.original.teachers || [];
        return teachers?.map(t => `${t.name} ${t.surname}`).join(", ") || "None";
      }
    },
    ...(role === "admin"
      ? [
        {
          id: "action",
          header: () => <div className="text-center">Action</div>,
          cell: ({ row }: { row: Row<Subject> }) => (
            <div className="flex items-center justify-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push(`/list/subjects/manage?action=edit&id=${row.original.id}`)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <DeleteDialog
                trigger={
                  <Button variant="ghost" size="icon">
                    <Trash className="h-4 w-4 text-destructive" />
                  </Button>
                }
                title="Delete Subject"
                description="This action cannot be undone. This will permanently delete the subject and its association with teachers."
                onDelete={async () => {
                  try {
                    const res = await axios.delete(`/api/subjects/delete/${row.original.id}`);
                    if (res.data.success) {
                      toast.success("Subject deleted successfully");
                      queryClient.invalidateQueries({ queryKey: ["subjects"] });
                    } else {
                      toast.error(res.data.message || "Failed to delete subject");
                    }
                  } catch (error: any) {
                    const message = error.response?.data?.message || "Unable to delete subject due to existing dependencies (lessons, etc.)";
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
