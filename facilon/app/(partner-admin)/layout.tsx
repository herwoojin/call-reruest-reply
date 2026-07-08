import { AppShell } from "@/components/app-shell";
import { RoleGuard } from "@/components/role-guard";

export default function PartnerAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard role="PARTNER_ADMIN">
      <AppShell
        title="협력사 관리"
        roleLabel="협력사"
        nav={[
          { href: "/board", label: "작업 보드", icon: "briefcase" },
          { href: "/map", label: "지도", icon: "map" },
        ]}
      >
        {children}
      </AppShell>
    </RoleGuard>
  );
}
