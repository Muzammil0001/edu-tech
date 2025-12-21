"use client";

import { ColumnDef, Row } from "@tanstack/react-table";
import { Edit, Eye, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/DataTableColumnHeaderProps";
import { Checkbox } from "@/components/ui/checkbox";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import Link from "next/link";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export type Teacher = {
  id: string;
  username: string;
  name: string;
  surname: string;
  email: string;
  subjects: { id: number; name: string }[];
  classes: { id: number; name: string }[];
  phone: string;
  address: string;
};

export const useTeacherColumns = (role?: string) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const deleteTeacherMutation = useMutation({
    mutationFn: async (teacherId: string) => {
      const res = await axios.delete(`/api/teachers/delete/${teacherId}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Teacher deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to delete teacher";
      toast.error(message);
    },
  });

  const columns: ColumnDef<Teacher>[] = [
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
      accessorKey: "username",
      header: "Username",
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => `${row.original.name} ${row.original.surname}`,
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
    },
    {
      accessorKey: "subjects",
      header: "Subjects",
      cell: ({ row }) => row.original.subjects?.map(s => s.name).join(", ") || "None",
    },
    {
      accessorKey: "classes",
      header: "Classes",
      cell: ({ row }) => row.original.classes?.map(c => c.name).join(", ") || "None",
    },
    {
      accessorKey: "phone",
      header: "Phone",
    },
    {
      accessorKey: "address",
      header: "Address",
    },
    ...(role === "admin"
      ? [
        {
          id: "action",
          header: () => <div className="text-center">Action</div>,
          cell: ({ row }: { row: Row<Teacher> }) => (
            <div className="flex items-center justify-center space-x-2">
              <Link href={`/list/teachers/profile/${row.original.id}`}>
                <Button variant="ghost" size="icon">
                  <Eye className="h-4 w-4" />
                </Button>
              </Link>
              <Link
                href={`/list/teachers/manage?action=edit&id=${row.original.id}`}
              >
                <Button variant="ghost" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
              </Link>
              <DeleteDialog
                trigger={
                  <Button variant="ghost" size="icon">
                    <Trash className="h-4 w-4 text-destructive" />
                  </Button>
                }
                title="Delete Teacher"
                description="This action cannot be undone. This will permanently delete the teacher record if there are no dependencies."
                onDelete={() => {
                  deleteTeacherMutation.mutate(row.original.id);
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
