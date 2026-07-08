"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Send } from "lucide-react";
import { useFacilon } from "@/lib/store";
import { ROLE_LABELS } from "@/lib/mock-data";
import type { Role } from "@/lib/status-machine";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/** 건별 대화창 (PRD F9) — 시스템 메시지 자동 기록 + 참여자 대화 */
export function RequestChat({
  requestId,
  me,
  myRole,
}: {
  requestId: string;
  me: string;
  myRole: Role;
}) {
  // 셀렉터는 안정 참조만 반환 (새 배열 반환 시 무한 리렌더)
  const allChats = useFacilon((s) => s.chats);
  const chats = useMemo(
    () => allChats.filter((c) => c.requestId === requestId),
    [allChats, requestId],
  );
  const sendMessage = useFacilon((s) => s.sendMessage);
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest" });
  }, [chats.length]);

  const send = () => {
    const t = text.trim();
    if (!t) return;
    sendMessage(requestId, me, myRole, t);
    setText("");
  };

  return (
    <div className="flex h-full flex-col">
      <div className="max-h-80 flex-1 space-y-2 overflow-y-auto p-3">
        {chats.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            아직 대화가 없습니다.
          </p>
        )}
        {chats.map((c) =>
          c.sender === null ? (
            <div key={c.id} className="flex justify-center">
              <span
                className={cn(
                  "max-w-[90%] rounded-full px-3 py-1 text-center text-[11px]",
                  c.type === "progress" && "bg-emerald-500/15 text-emerald-300",
                  c.type === "quote" && "bg-violet-500/15 text-violet-300",
                  c.type === "schedule" && "bg-cyan-500/15 text-cyan-300",
                  c.type === "system" && "bg-muted text-muted-foreground",
                )}
              >
                {c.content} · {c.at}
              </span>
            </div>
          ) : (
            <div
              key={c.id}
              className={cn(
                "flex flex-col",
                c.sender === me ? "items-end" : "items-start",
              )}
            >
              <span className="mb-0.5 text-[10px] text-muted-foreground">
                {c.sender} ({c.senderRole ? ROLE_LABELS[c.senderRole] : ""}) ·{" "}
                {c.at}
              </span>
              <p
                className={cn(
                  "max-w-[80%] rounded-2xl px-3 py-2 text-sm",
                  c.sender === me
                    ? "rounded-br-sm bg-primary text-primary-foreground"
                    : "rounded-bl-sm bg-secondary",
                )}
              >
                {c.content}
              </p>
            </div>
          ),
        )}
        <div ref={endRef} />
      </div>

      <div className="flex gap-2 border-t p-3">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="메시지 입력…"
        />
        <Button size="icon" className="shrink-0" onClick={send} aria-label="전송">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
