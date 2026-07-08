import { AppShell } from "@/components/app-shell";
import { RoleGuard } from "@/components/role-guard";

export default function OfcLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard role="OFC">
      <AppShell
        title="운영 담당"
        roleLabel="OFC"
        nav={[
          { href: "/home", label: "홈", icon: "home" },
          { href: "/request/new", label: "요청 등록", icon: "plus" },
          { href: "/my-requests", label: "내 요청", icon: "list" },
          { href: "/map", label: "지도", icon: "map" },
        ]}
      >
        {children}
      </AppShell>
    </RoleGuard>
  );
}
