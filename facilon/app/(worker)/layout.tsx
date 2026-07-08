import { AppShell } from "@/components/app-shell";
import { RoleGuard } from "@/components/role-guard";

export default function WorkerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard role="PARTNER_WORKER">
      <AppShell
        title="작업자"
        roleLabel="작업자"
        nav={[
          { href: "/today", label: "오늘의 작업", icon: "wrench" },
          { href: "/map", label: "지도", icon: "map" },
        ]}
      >
        {children}
      </AppShell>
    </RoleGuard>
  );
}
