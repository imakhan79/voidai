import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LiveDot } from "@/components/ui/LiveDot";
import { SignOutButton } from "@/components/nav/SignOutButton";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/discoveries", label: "Discoveries" },
  { href: "/projects", label: "Projects" },
  { href: "/settings/org", label: "Settings" },
];

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-border bg-background-panel px-6 py-3">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="font-tabular text-sm font-bold tracking-tight">
            VOID<span className="text-accent">AI</span>
          </Link>
          <nav className="flex items-center gap-5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs font-medium text-foreground-muted hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <LiveDot state="ok" label="System" />
          <span className="text-xs text-foreground-muted">{user.email}</span>
          <SignOutButton />
        </div>
      </header>
      <main className="flex-1 bg-background px-6 py-6">{children}</main>
    </div>
  );
}
