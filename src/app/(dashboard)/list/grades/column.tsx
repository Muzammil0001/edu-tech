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

export type Grade = {
    id: number;
    level: number;
};

export const useGradeColumns = (role?: string) => {
    const queryClient = useQueryClient();
    const router = useRouter();

    const columns: ColumnDef<Grade>[] = [
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
            accessorKey: "level",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Grade Level" />
            ),
            cell: ({ row }) => `Level ${row.original.level}`,
        },
        ...(role === "admin"
            ? [
                {
                    id: "action",
                    header: () => <div className="text-center">Action</div>,
                    cell: ({ row }: { row: Row<Grade> }) => (
                        <div className="flex items-center justify-center space-x-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => router.push(`/list/grades/manage?action=edit&id=${row.original.id}`)}
                            >
                                <Edit className="h-4 w-4" />
                            </Button>
                            <DeleteDialog
                                trigger={
                                    <Button variant="ghost" size="icon">
                                        <Trash className="h-4 w-4 text-destructive" />
                                    </Button>
                                }
                                title="Delete Grade"
                                description="This action cannot be undone. This will permanently delete the grade level and its associations."
                                onDelete={async () => {
                                    try {
                                        const res = await axios.delete(`/api/grades/delete/${row.original.id}`);
                                        if (res.data.success) {
                                            toast.success("Grade deleted successfully");
                                            queryClient.invalidateQueries({ queryKey: ["grades"] });
                                        } else {
                                            toast.error(res.data.message || "Failed to delete grade");
                                        }
                                    } catch (error: any) {
                                        const message = error.response?.data?.message || "Unable to delete grade due to existing dependencies (classes, students)";
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
