export function Spinner({ size = 20 }: { size?: number }) {
  return (
    <svg
      className="animate-spin text-accent"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-label="Carregando"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" />
      <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

export function FullPageSpinner() {
  return (
    <div className="flex flex-1 items-center justify-center py-24">
      <Spinner size={28} />
    </div>
  )
}
