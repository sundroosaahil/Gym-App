// Fires a one-time, fire-and-forget request to the Render backend as soon as
// the app loads, so the free-tier instance starts waking up in the background
// before the admin actually navigates to /admin or /login.
//
// We deliberately:
// - use mode: 'no-cors' so we don't need to touch backend CORS config,
//   and so we never try to read/parse a response we don't care about
// - swallow errors, since this is a best-effort optimization, not a
//   request anything else depends on
// - only fire once per browser session (sessionStorage), since pinging
//   again after the server is already awake does nothing useful

export function warmBackend() {
  if (typeof window === 'undefined') return;

  const alreadyWarmed = sessionStorage.getItem('backendWarmed');
  if (alreadyWarmed) return;

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  if (!backendUrl) {
    console.warn('VITE_BACKEND_URL is not set — skipping backend warm-up ping');
    return;
  }

  fetch(backendUrl, { mode: 'no-cors' }).catch(() => {
    // Ignore — this is just a warm-up ping, not a real request.
  });

  sessionStorage.setItem('backendWarmed', 'true');
}