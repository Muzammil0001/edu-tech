import React from "react"
import { Card } from "@/components/ui/card"
import prisma from "@/lib/prisma"
import { format } from "date-fns"

import { Announcement } from "@prisma/client"

const Announcements = async () => {
  // Fetch real announcement data from database
  let announcements: Announcement[] = [];
  try {
    announcements = await prisma.announcement.findMany({
      take: 3,
      orderBy: {
        date: 'desc'
      }
    });
  } catch (error) {
    console.error("Failed to fetch announcements:", error);
  }

  return (
    <div className="bg-white p-4 rounded-md">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Announcements</h1>
        <span className="text-xs text-muted-foreground cursor-pointer hover:underline">View All</span>
      </div>
      <div className="space-y-4">
        {announcements.length > 0 ? (
          announcements.map((announcement) => (
            <div key={announcement.id} className="p-4 rounded-md bg-muted/30 border border-muted-foreground/10 hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-medium text-sm">{announcement.title}</h2>
                <span className="text-[10px] text-muted-foreground bg-white px-2 py-1 rounded-md">
                  {format(announcement.date, "yyyy-MM-dd")}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {announcement.description}
              </p>
            </div>
          ))
        ) : (
          <p className="text-center text-sm text-muted-foreground py-4">No announcements yet.</p>
        )}
      </div>
    </div>
  )
}

export default Announcements
