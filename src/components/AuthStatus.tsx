import { getCurrentSession } from "@/lib/auth/current";
import { tr } from "@/messages/tr";

export async function AuthStatus() {
  const { user } = await getCurrentSession();
  const t = tr.auth;

  if (!user) {
    // Plain <a>, not <Link>: Link would prefetch the route handler and set OAuth cookies early.
    return (
      <a href="/login/github" className="font-sans text-sm underline underline-offset-2 hover:text-ink">
        {t.signIn}
      </a>
    );
  }

  return (
    <form method="post" action="/logout" className="flex items-center gap-3 font-sans text-sm text-muted">
      <span>{t.signedIn}</span>
      <button type="submit" className="underline underline-offset-2 hover:text-ink">
        {t.signOut}
      </button>
    </form>
  );
}
