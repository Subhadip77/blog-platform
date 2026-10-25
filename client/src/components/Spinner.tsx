export function Spinner() {
  return (
    <div className="flex justify-center p-12" role="status" aria-label="Loading">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-line border-t-primary" />
    </div>
  );
}