import { Suspense, type ReactNode } from "react";
import { auth } from "@clerk/nextjs/server";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<p className="p-6 text-center text-gray-500">Carregando...</p>}>
      <DashboardGuard>{children}</DashboardGuard>
    </Suspense>
  );
}

async function DashboardGuard({ children }: { children: ReactNode }) {
  const { userId, redirectToSignIn } = await auth();

  if (!userId) {
    return redirectToSignIn();
  }

  return <>{children}</>;
}
