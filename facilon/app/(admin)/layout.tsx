import { AppShell } from "@/components/app-shell";
import { RoleGuard } from "@/components/role-guard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard role="ADMIN">
      <AppShell
        title="본부"
        roleLabel="관리자"
        nav={[
          { href: "/dashboard", label: "대시보드", icon: "home" },
          { href: "/permissions", label: "권한", icon: "shield" },
          { href: "/users", label: "사용자", icon: "users" },
          { href: "/stores", label: "점포", icon: "store" },
          { href: "/prices", label: "단가", icon: "tag" },
          { href: "/stats", label: "통계", icon: "chart" },
        ]}
      >
        {children}
      </AppShell>
    </RoleGuard>
  );
}
