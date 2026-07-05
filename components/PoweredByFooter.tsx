import Link from "next/link";

/**
 * The viral mechanic: every shared ride carries this back to the app's
 * own download/landing page. Seen exactly by the audience most likely to
 * own an EUC themselves — riders sharing rides in forums/group chats.
 */
export function PoweredByFooter() {
  return (
    <div className="mt-12 pt-6 border-t border-outline text-center">
      <Link
        href="/"
        className="font-display text-sm text-cream/60 hover:text-reactor-gold transition-colors"
      >
        Tracked with <span className="text-reactor-gold font-semibold">Wattson</span>
      </Link>
    </div>
  );
}
