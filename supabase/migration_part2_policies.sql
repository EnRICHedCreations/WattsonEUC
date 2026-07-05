-- Wattson companion site — migration part 2: RLS policies
-- Run AFTER part 1.

alter table public.shared_rides enable row level security;

-- Anyone with a share link can view a ride — that's the entire point of
-- a public share link model. No public INSERT/UPDATE/DELETE policy exists:
-- rides are only ever written by the upload API route using the
-- SERVICE ROLE key, which bypasses RLS entirely by design. Never expose
-- the service role key to the browser/app directly — the Android app
-- calls this site's /api/rides endpoint, which holds the service key
-- server-side only.
create policy "public can view shared rides"
  on public.shared_rides for select
  using (true);
