const api = (import.meta.env.VITE_API_URL ?? 'http://localhost:5001/api/v1') as string;

export function SocialButtons() {
  const cls = 'flex-1 rounded border border-line bg-surface px-4 py-2 text-center text-sm font-medium hover:bg-page';
  return (
    <div className="mt-4 flex gap-3">
      {/* Full-page redirect: OAuth is a browser flow, not an XHR call. */}
      <a href={`${api}/auth/google`} className={cls}>Google</a>
      <a href={`${api}/auth/facebook`} className={cls}>Facebook</a>
    </div>
  );
}