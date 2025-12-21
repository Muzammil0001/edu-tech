"use client";

import { ColumnDef, Row } from "@tanstack/react-table";
import { Edit, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/DataTableColumnHeaderProps";
import { Checkbox } from "@/components/ui/checkbox";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

export type Attendance = {
    id: number;
    date: string;
    checkIn: string;
    checkOut: string | null;
    student: string;
    class: string;
    device: string;
};

export const useAttendanceColumns = () => {
    const { user } = useUser();
    const role = user?.publicMetadata.role as string | undefined;
    const queryClient = useQueryClient();
    const router = useRouter();

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => await axios.delete(`/api/attendance/delete/${id}`),
        onSuccess: () => {
            toast.success("Attendance record deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["attendance"] });
        },
        onError: () => toast.error("Failed to delete attendance record"),
    });

    const columns: ColumnDef<Attendance>[] = [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
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
            header: ({ column }) => <DataTableColumnHeader column={column} title="Student" />,
        },
        {
            accessorKey: "class",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Class" />,
        },
        {
            accessorKey: "date",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
            cell: ({ row }) => <span>{row.original.date ? format(new Date(row.original.date), "PPP") : "N/A"}</span>
        },
        {
            accessorKey: "checkIn",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Check In" />,
            cell: ({ row }) => <span>{row.original.checkIn ? format(new Date(row.original.checkIn), "p") : "N/A"}</span>
        },
        {
            accessorKey: "checkOut",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Check Out" />,
            cell: ({ row }) => <span>{row.original.checkOut ? format(new Date(row.original.checkOut), "p") : "-"}</span>
        },
        {
            accessorKey: "device",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Device" />,
        },
        ...(role === "admin"
            ? [
                {
                    id: "action",
                    header: () => <div className="text-center">Action</div>,
                    cell: ({ row }: { row: Row<Attendance> }) => (
                        <div className="flex items-center justify-center space-x-2">
                            <Button variant="ghost" size="icon" onClick={() => router.push(`/list/attendance/manage?action=edit&id=${row.original.id}`)}>
                                <Edit className="h-4 w-4" />
                            </Button>
                            <DeleteDialog
                                trigger={
                                    <Button variant="ghost" size="icon">
                                        <Trash className="text-destructive h-4 w-4" />
                                    </Button>
                                }
                                title="Delete Attendance"
                                description="This action cannot be undone."
                                onDelete={() => deleteMutation.mutate(row.original.id)}
                            />
                        </div>
                    ),
                },
            ]
            : []),
    ];

    return columns;
};
