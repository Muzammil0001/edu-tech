import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
    const user = await currentUser();

    if (!user) {
        redirect("/sign-in");
    }

    const role = user.publicMetadata.role as string | undefined;

    if (role) {
        redirect(`/${role}`);
    }

    // Fallback if role is not set (you might want to redirect to a setup page or just sign-in)
    redirect("/sign-in");
}
