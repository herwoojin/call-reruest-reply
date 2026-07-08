import type { WorkPhoto } from "@/lib/mock-data";

/** 작업 사진 타임라인 (목업: 그라디언트 placeholder) */
export function PhotoStrip({ photos }: { photos: WorkPhoto[] }) {
  if (photos.length === 0)
    return (
      <p className="py-4 text-center text-xs text-muted-foreground">
        등록된 작업 사진이 없습니다.
      </p>
    );

  return (
    <div className="flex gap-3 overflow-x-auto pb-1">
      {photos.map((p) => (
        <figure key={p.id} className="w-32 shrink-0">
          <div
            className="flex h-24 w-32 items-center justify-center rounded-lg text-xs font-medium text-white/90"
            style={{ background: p.gradient }}
          >
            사진 · {p.phase}
          </div>
          <figcaption className="mt-1 text-[10px] leading-tight text-muted-foreground">
            {p.label}
            <br />
            {p.at}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
