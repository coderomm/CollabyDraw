import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";

export default async function MainLayout({ children }: { children: React.ReactNode; }) {
    const session = await getServerSession(authOptions);
    const user = session?.user;
    if (!user || !user.id) {
        return (
            <>
                <main>{children}</main>
            </>
        )
    }
    return (
        <>
            <Header />
            <main>{children}</main>
            <Footer />
        </>
    );
}