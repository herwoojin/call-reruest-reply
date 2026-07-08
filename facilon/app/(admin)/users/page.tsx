"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROLES, ROLE_LABELS } from "@/lib/mock-data";
import { useFacilon } from "@/lib/store";
import type { Role } from "@/lib/status-machine";
import { cn } from "@/lib/utils";

export default function AdminUsers() {
  const users = useFacilon((s) => s.users);
  const setUserRole = useFacilon((s) => s.setUserRole);

  return (
    <div className="space-y-4 p-4">
      <header>
        <h1 className="text-xl font-bold">사용자 관리</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          역할 부여·지역 매핑·협력사 연결·계정 활성 관리
        </p>
      </header>

      <div className="space-y-2">
        {users.map((u) => (
          <div
            key={u.id}
            className={cn(
              "flex items-center gap-3 rounded-xl border bg-card p-3",
              !u.active && "opacity-50",
            )}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-bold">
              {u.name[0]}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {u.name}
                {!u.active && (
                  <span className="ml-1.5 text-xs font-normal text-red-400">
                    정지
                  </span>
                )}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {u.email} · {u.region}
              </p>
            </div>
            <Select
              value={u.role}
              onValueChange={(v) => setUserRole(u.id, v as Role)}
            >
              <SelectTrigger className="w-28 shrink-0 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>
    </div>
  );
}
