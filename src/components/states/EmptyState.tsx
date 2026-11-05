interface EmptyStateProps {
  title: string;
  hint?: string;
}

/** Estado vazio (nenhuma busca feita ou nenhum resultado). */
export default function EmptyState({ title, hint }: EmptyStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-12 text-center backdrop-blur-md sm:py-16"
    >
      <span aria-hidden="true" className="text-4xl">
        🌍
      </span>
      <p className="font-medium text-white/90">{title}</p>
      {hint && <p className="max-w-md text-sm text-white/70">{hint}</p>}
    </div>
  );
}
