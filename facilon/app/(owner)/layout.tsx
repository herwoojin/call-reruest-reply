import { AppShell } from "@/components/app-shell";
import { RoleGuard } from "@/components/role-guard";

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard role="OWNER">
      <AppShell
        title="내 점포"
        roleLabel="경영주"
        nav={[
          { href: "/my-store", label: "내 점포", icon: "store" },
          { href: "/map", label: "지도", icon: "map" },
        ]}
      >
        {children}
      </AppShell>
    </RoleGuard>
  );
}
