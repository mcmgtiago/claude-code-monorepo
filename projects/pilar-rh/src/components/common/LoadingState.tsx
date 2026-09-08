export function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-paper">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-full border-2 border-line border-t-wine animate-spin" />
        <p className="text-ink-soft font-medium">Carregando...</p>
      </div>
    </div>
  );
}
