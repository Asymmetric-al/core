export function Logo() {
  return (
    <div className="flex items-center gap-2 text-zinc-900">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-xs font-black text-white">
        G
      </span>
      <div className="flex flex-col leading-none">
        <span className="text-xs font-black tracking-[0.22em] uppercase">
          Give Hope
        </span>
        <span className="text-[10px] font-semibold tracking-[0.18em] uppercase text-zinc-500">
          Site Studio
        </span>
      </div>
    </div>
  );
}
