import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { users } from "@clerk/clerk-sdk-node";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { success: false, message: "Teacher ID is required" },
      { status: 400 }
    );
  }

  try {
    // Step 1: Check if teacher exists
    const teacher = await prisma.teacher.findUnique({
      where: { id },
    });

    if (!teacher) {
      return NextResponse.json(
        { success: false, message: "Teacher not found" },
        { status: 404 }
      );
    }

    // Step 2: Delete from local database first (handles relational checks)
    try {
      await prisma.teacher.delete({
        where: { id },
      });
    } catch (error: any) {
      // Handle common Prisma foreign key constraint error (P2003)
      if (error.code === 'P2003') {
        return NextResponse.json(
          {
            success: false,
            message: "Unable to delete teacher because they are assigned as a class supervisor or have existing lessons. Please reassign or delete those records first."
          },
          { status: 400 }
        );
      }
      throw error;
    }

    // Step 3: Delete user from Clerk after successful DB deletion
    try {
      await users.deleteUser(id);
    } catch (clerkError) {
      console.warn("Deleted from database but Clerk user deletion failed or user already gone:", clerkError);
      // We still return true because the primary record in our system is gone
    }

    return NextResponse.json({
      success: true,
      message: "Teacher deleted successfully",
    });
  } catch (error: any) {
    console.error("[DELETE_TEACHER_ERROR]", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
