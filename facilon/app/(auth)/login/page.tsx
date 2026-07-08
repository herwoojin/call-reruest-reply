"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ADMIN_CREDENTIALS,
  FM_ACCOUNTS,
  OFC_EMAIL_DOMAIN,
  PARTNER_ADMIN_ACCOUNTS,
  PARTNER_WORKER_ACCOUNTS,
  ROLE_HOME,
  ROLE_LOGIN_LABEL,
  ROLE_LOGIN_METHOD,
  generateOtp,
  isValidOfcEmail,
  ownerCodeFor,
  verifyAdmin,
  verifyOwnerCode,
} from "@/lib/auth-config";
import { STORES } from "@/lib/mock-data";
import { useSession, type Session } from "@/lib/session-store";
import type { Role } from "@/lib/status-machine";

const ROLE_ORDER: Role[] = [
  "OWNER",
  "OFC",
  "FM",
  "PARTNER_ADMIN",
  "PARTNER_WORKER",
  "ADMIN",
];

const ROLE_EMOJI: Record<Role, string> = {
  OWNER: "🏪",
  OFC: "📋",
  FM: "🔧",
  PARTNER_ADMIN: "🏢",
  PARTNER_WORKER: "👷",
  ADMIN: "🛡️",
};

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const login = useSession((s) => s.login);

  const initialRole = params.get("role") as Role | null;
  const [role, setRole] = useState<Role | null>(
    initialRole && ROLE_ORDER.includes(initialRole) ? initialRole : null,
  );

  const complete = (session: Session) => {
    login(session);
    router.push(ROLE_HOME[session.role]);
  };

  if (!role) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 p-6">
        <header className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">시설ON</h1>
          <p className="text-sm text-muted-foreground">
            어떤 입장으로 로그인하시나요?
          </p>
        </header>
        <div className="grid gap-3">
          {ROLE_ORDER.map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className="flex items-center gap-3 rounded-xl border bg-card p-4 text-left transition-colors hover:bg-accent"
            >
              <span className="text-2xl">{ROLE_EMOJI[r]}</span>
              <div>
                <div className="font-semibold">{ROLE_LOGIN_LABEL[r]}</div>
                <div className="text-xs text-muted-foreground">
                  {ROLE_LOGIN_METHOD[r]}
                </div>
              </div>
            </button>
          ))}
        </div>
        <p className="text-center text-xs text-muted-foreground">
          <Link href="/" className="text-primary">
            홈으로
          </Link>
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 p-6">
      <button
        onClick={() => setRole(null)}
        className="!min-h-0 flex items-center gap-1 text-sm text-muted-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> 역할 다시 선택
      </button>

      <header className="space-y-1">
        <p className="text-3xl">{ROLE_EMOJI[role]}</p>
        <h1 className="text-2xl font-bold">{ROLE_LOGIN_LABEL[role]} 로그인</h1>
        <p className="text-sm text-muted-foreground">
          {ROLE_LOGIN_METHOD[role]}
        </p>
      </header>

      {role === "OWNER" && <OwnerForm onDone={complete} />}
      {role === "OFC" && <OfcForm onDone={complete} />}
      {role === "FM" && <FmForm onDone={complete} />}
      {role === "ADMIN" && <AdminForm onDone={complete} />}
      {role === "PARTNER_ADMIN" && <PartnerAdminForm onDone={complete} />}
      {role === "PARTNER_WORKER" && <WorkerForm onDone={complete} />}
    </main>
  );
}

// ── 경영주: 점포 접속 코드 ──
function OwnerForm({ onDone }: { onDone: (s: Session) => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    const res = verifyOwnerCode(code);
    if (!res.ok) {
      setError("접속 코드가 올바르지 않습니다. 담당 OFC에게 문의하세요.");
      return;
    }
    onDone({
      role: "OWNER",
      name: res.name,
      storeId: res.storeId,
      storeName: res.storeName,
    });
  };

  return (
    <div className="space-y-3">
      <Input
        placeholder="점포 접속 코드 (예: 0231ON)"
        value={code}
        onChange={(e) => {
          setCode(e.target.value);
          setError(null);
        }}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        autoFocus
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button className="w-full" size="lg" disabled={!code} onClick={submit}>
        경영주 모드 입장
      </Button>
      <DemoHint>
        데모 코드 — {STORES.slice(0, 3).map((s) => (
          <span key={s.id} className="mr-2">
            {s.name.slice(0, 4)}: <b>{ownerCodeFor(s.storeCode)}</b>
          </span>
        ))}
      </DemoHint>
    </div>
  );
}

// ── OFC: 회사 이메일 6자리 인증 ──
function OfcForm({ onDone }: { onDone: (s: Session) => void }) {
  const [email, setEmail] = useState("");
  const [sentOtp, setSentOtp] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const sendOtp = () => {
    if (!isValidOfcEmail(email)) {
      setError(`${OFC_EMAIL_DOMAIN} 이메일만 인증할 수 있습니다.`);
      return;
    }
    setError(null);
    setSentOtp(generateOtp());
  };

  const verify = () => {
    if (input.trim() !== sentOtp) {
      setError("인증번호가 일치하지 않습니다.");
      return;
    }
    onDone({
      role: "OFC",
      name: email.split("@")[0],
      email: email.trim(),
    });
  };

  return (
    <div className="space-y-3">
      <Input
        type="email"
        placeholder="이름@gsretail.com"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setError(null);
        }}
        disabled={!!sentOtp}
        autoFocus
      />
      {!sentOtp ? (
        <Button
          className="w-full"
          size="lg"
          disabled={!email}
          onClick={sendOtp}
        >
          인증번호 발송
        </Button>
      ) : (
        <>
          <div className="rounded-xl border border-primary/40 bg-primary/5 p-3 text-sm">
            📧 <b>{email}</b> 로 6자리 인증번호를 발송했습니다.
            <br />
            <span className="text-xs text-muted-foreground">
              (데모 인증번호: <b className="tabular-nums">{sentOtp}</b> — 실서비스는
              메일로 발송)
            </span>
          </div>
          <Input
            inputMode="numeric"
            maxLength={6}
            placeholder="6자리 인증번호"
            value={input}
            onChange={(e) => {
              setInput(e.target.value.replace(/\D/g, ""));
              setError(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && verify()}
            className="text-center text-lg tracking-[0.4em]"
            autoFocus
          />
          <Button
            className="w-full"
            size="lg"
            disabled={input.length !== 6}
            onClick={verify}
          >
            인증하고 입장
          </Button>
        </>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

// ── FM: 사번 ──
function FmForm({ onDone }: { onDone: (s: Session) => void }) {
  const [id, setId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    const name = FM_ACCOUNTS[id.trim()];
    if (!name) {
      setError("등록되지 않은 사번입니다.");
      return;
    }
    onDone({ role: "FM", name, accountId: id.trim() });
  };

  return (
    <div className="space-y-3">
      <Input
        placeholder="사번 (예: fm-kim)"
        value={id}
        onChange={(e) => {
          setId(e.target.value);
          setError(null);
        }}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        autoFocus
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button className="w-full" size="lg" disabled={!id} onClick={submit}>
        입장
      </Button>
      <DemoHint>
        데모 사번: <b>fm-kim</b> (김시설), <b>fm-na</b> (나담당)
      </DemoHint>
    </div>
  );
}

// ── 관리자: ID + PW ──
function AdminForm({ onDone }: { onDone: (s: Session) => void }) {
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    if (!verifyAdmin(id, pw)) {
      setError("ID 또는 비밀번호가 올바르지 않습니다.");
      return;
    }
    onDone({ role: "ADMIN", name: "본부관리자", accountId: id.trim() });
  };

  return (
    <div className="space-y-3">
      <Input
        placeholder="관리자 ID"
        value={id}
        onChange={(e) => {
          setId(e.target.value);
          setError(null);
        }}
        autoFocus
      />
      <Input
        type="password"
        placeholder="비밀번호"
        value={pw}
        onChange={(e) => {
          setPw(e.target.value);
          setError(null);
        }}
        onKeyDown={(e) => e.key === "Enter" && submit()}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button
        className="w-full"
        size="lg"
        disabled={!id || !pw}
        onClick={submit}
      >
        관리자 입장
      </Button>
      <DemoHint>
        데모 계정: <b>{ADMIN_CREDENTIALS.id}</b> /{" "}
        <b>{ADMIN_CREDENTIALS.password}</b>
      </DemoHint>
    </div>
  );
}

// ── 협력사 관리자: 발급 ID ──
function PartnerAdminForm({ onDone }: { onDone: (s: Session) => void }) {
  const [id, setId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    const acc = PARTNER_ADMIN_ACCOUNTS[id.trim()];
    if (!acc) {
      setError("발급되지 않은 ID입니다. 본부 관리자에게 문의하세요.");
      return;
    }
    onDone({
      role: "PARTNER_ADMIN",
      name: acc.name,
      company: acc.company,
      accountId: id.trim(),
    });
  };

  return (
    <div className="space-y-3">
      <Input
        placeholder="발급받은 협력사 ID (예: cooltech-admin)"
        value={id}
        onChange={(e) => {
          setId(e.target.value);
          setError(null);
        }}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        autoFocus
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button className="w-full" size="lg" disabled={!id} onClick={submit}>
        입장
      </Button>
      <DemoHint>
        데모 ID: <b>cooltech-admin</b>, <b>hanbit-admin</b>, <b>woori-admin</b>
      </DemoHint>
    </div>
  );
}

// ── 협력사 작업자: 승인 ID ──
function WorkerForm({ onDone }: { onDone: (s: Session) => void }) {
  const [id, setId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    const acc = PARTNER_WORKER_ACCOUNTS[id.trim()];
    if (!acc) {
      setError("승인되지 않은 작업자 ID입니다. 협력사 관리자에게 문의하세요.");
      return;
    }
    onDone({
      role: "PARTNER_WORKER",
      name: acc.name,
      company: acc.company,
      accountId: id.trim(),
    });
  };

  return (
    <div className="space-y-3">
      <Input
        placeholder="승인된 작업자 ID (예: choi-01)"
        value={id}
        onChange={(e) => {
          setId(e.target.value);
          setError(null);
        }}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        autoFocus
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button className="w-full" size="lg" disabled={!id} onClick={submit}>
        입장
      </Button>
      <DemoHint>
        데모 ID: <b>choi-01</b> (최기사), <b>park-02</b>, <b>jung-03</b>
      </DemoHint>
    </div>
  );
}

function DemoHint({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg bg-secondary/60 p-2.5 text-xs leading-relaxed text-muted-foreground">
      {children}
    </p>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center text-sm text-muted-foreground">
          불러오는 중…
        </div>
      }
    >
      <LoginInner />
    </Suspense>
  );
}
