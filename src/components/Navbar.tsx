"use client";

import { Megaphone, MessageCircle, Search } from "lucide-react";
import { SidebarTrigger } from "./ui/sidebar";
import { Input } from "./ui/input";
import { UserButton, useUser } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import React, { useEffect, useState } from "react";

const Navbar = () => {
  const { user, isLoaded } = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const role = user?.publicMetadata?.role as string | undefined;
  const emailPrefix = user?.emailAddresses?.[0]?.emailAddress?.split('@')[0] || "";
  const displayName = role === "admin"
    ? user?.username || emailPrefix
    : user?.fullName || user?.username || "User";

  const { data: countData } = useQuery({
    queryKey: ["announcementCount"],
    queryFn: async () => {
      const res = await axios.get("/api/announcements/count");
      return res.data.count;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const announcementCount = countData || 0;
  const messageCount = 0;

  if (!mounted || !isLoaded) {
    return (
      <div className='flex items-center justify-between p-4 border-b bg-background shadow-sm h-[73px]'>
        <div className="flex items-center gap-4">
          <SidebarTrigger />
        </div>
        <div className="flex items-center gap-6">
          <div className="animate-pulse bg-muted rounded-full w-9 h-9" />
          <div className="animate-pulse bg-muted rounded-full w-9 h-9" />
          <div className="animate-pulse bg-muted w-20 h-8 rounded-md" />
        </div>
      </div>
    );
  }

  return (
    <div className='flex items-center justify-between p-4 border-b bg-background shadow-sm'>
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div className="hidden md:flex items-center relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input type="text" placeholder="Search..." className="w-64 pl-9 bg-muted/50 rounded-full border-none focus-visible:ring-1" />
        </div>
      </div>

      {/* ICONS AND USER */}
      <div className='flex items-center gap-4 md:gap-6 justify-end'>
        <div className='bg-muted rounded-full w-9 h-9 flex items-center justify-center cursor-pointer relative hover:bg-muted/80 transition-colors'>
          <MessageCircle className="w-5 h-5" />
          {messageCount > 0 && (
            <div className='absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-destructive text-destructive-foreground rounded-full text-[10px] font-bold border-2 border-background'>
              {messageCount}
            </div>
          )}
        </div>
        <div className='bg-muted rounded-full w-9 h-9 flex items-center justify-center cursor-pointer relative hover:bg-muted/80 transition-colors'>
          <Megaphone className="w-5 h-5" />
          {announcementCount > 0 && (
            <div className='absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-primary text-primary-foreground rounded-full text-[10px] font-bold border-2 border-background'>
              {announcementCount}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 pl-4 border-l">
          <div className='flex flex-col text-right hidden sm:flex'>
            <span className="text-sm font-semibold truncate max-w-[150px]">{displayName}</span>
            <span className="text-xs text-muted-foreground capitalize">{role || "user"}</span>
          </div>
          <div className="flex items-center justify-center min-w-[32px]">
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
