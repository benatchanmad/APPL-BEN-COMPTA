import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";
import Sidebar from "@/components/layouts/Sidebar";
import Header from "@/components/layouts/Header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentSession();

  if (!session || !session.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#F4F6FA] flex">
      {/* Fixed Left Navigation */}
      <Sidebar user={session.user} organization={session.organization} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col pl-64 min-w-0">
        <Header user={session.user} organization={session.organization} />
        <main className="flex-1 p-8 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
