"use client";

import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Loader from "@/components/ui/loader";

const SettingsPage = () => {
    const { isLoaded, user } = useUser();

    if (!isLoaded) return <div className="flex h-full items-center justify-center p-10"><Loader /></div>;

    const role = user?.publicMetadata?.role as string || "User";
    const displayName = role === "admin"
        ? user?.username || user?.primaryEmailAddress?.emailAddress.split('@')[0]
        : `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || user?.username || "User";

    return (
        <div className="p-6 flex flex-col gap-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold">Settings</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>View and manage your account details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="flex-1 w-full space-y-1">
                            <Label>Display Name</Label>
                            <Input value={displayName} disabled />
                        </div>
                        <div className="flex-1 w-full space-y-1">
                            <Label>Email Address</Label>
                            <Input value={user?.primaryEmailAddress?.emailAddress} disabled />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label>Role</Label>
                        <div>
                            <Badge variant="secondary" className="capitalize">
                                {role}
                            </Badge>
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button variant="outline" disabled>Update Profile (Managed via Clerk)</Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>System Preferences</CardTitle>
                    <CardDescription>Customization options for your dashboard.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-gray-500">More settings coming soon...</p>
                </CardContent>
            </Card>
        </div>
    );
};

export default SettingsPage;
