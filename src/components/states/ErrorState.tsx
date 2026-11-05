interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

/** Estado de erro com ação de "tentar novamente". */
export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-4 rounded-2xl border border-red-300/20 bg-red-400/10 px-5 py-12 text-center backdrop-blur-md"
    >
      <span aria-hidden="true" className="text-4xl">
        ⚠️
      </span>
      <p className="max-w-lg text-white/90">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-lg bg-accent-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        Tentar novamente
      </button>
    </div>
  );
}
