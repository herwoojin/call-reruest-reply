"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { PAGE_KEYS } from "@/lib/page-access";
import { PAGE_LABELS, ROLES, ROLE_LABELS } from "@/lib/mock-data";
import { useFacilon } from "@/lib/store";

export default function AdminPermissions() {
  const permissions = useFacilon((s) => s.permissions);
  const toggle = useFacilon((s) => s.togglePermission);

  return (
    <div className="space-y-4 p-4">
      <header>
        <h1 className="text-xl font-bold">화면 권한 매트릭스</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          역할×화면 열람 권한. 변경 즉시 전 클라이언트에 반영됩니다
          (perm:invalidate). 개별 사용자 예외는 사용자 관리에서 부여합니다.
        </p>
      </header>

      <div className="-mx-4 overflow-x-auto px-4">
        <table className="w-full min-w-[560px] text-xs">
          <thead>
            <tr className="border-b">
              <th className="sticky left-0 bg-background py-2 pr-2 text-left font-medium">
                화면
              </th>
              {ROLES.map((r) => (
                <th key={r} className="px-1.5 py-2 text-center font-medium">
                  {ROLE_LABELS[r]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PAGE_KEYS.map((pk) => (
              <tr key={pk} className="border-b border-border/50">
                <td className="sticky left-0 bg-background py-2.5 pr-2">
                  {PAGE_LABELS[pk]}
                  <p className="text-[10px] text-muted-foreground">{pk}</p>
                </td>
                {ROLES.map((role) => (
                  <td key={role} className="px-1.5 py-2.5 text-center">
                    <Checkbox
                      checked={permissions[pk][role]}
                      onCheckedChange={() => toggle(pk, role)}
                      aria-label={`${PAGE_LABELS[pk]} ${ROLE_LABELS[role]}`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="rounded-lg bg-secondary p-3 text-xs text-muted-foreground">
        💡 지도·상세 화면의 데이터 범위(본인 점포/담당군/전국/자사)는 체크와
        별개로 서버 보안 규칙이 최종 제한합니다.
      </p>
    </div>
  );
}
