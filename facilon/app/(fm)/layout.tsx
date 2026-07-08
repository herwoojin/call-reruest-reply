import { AppShell } from "@/components/app-shell";
import { RoleGuard } from "@/components/role-guard";

export default function FmLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard role="FM">
      <AppShell
        title="시설담당"
        roleLabel="FM"
        nav={[
          { href: "/pool", label: "전국 풀", icon: "inbox" },
          { href: "/my-cases", label: "내 접수 건", icon: "clipboard" },
          { href: "/map", label: "지도", icon: "map" },
        ]}
      >
        {children}
      </AppShell>
    </RoleGuard>
  );
}
