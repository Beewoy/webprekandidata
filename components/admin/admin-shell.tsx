"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  Bot,
  ClipboardList,
  CreditCard,
  Globe2,
  LayoutDashboard,
  LogOut,
  Menu,
  Shield,
  Users,
  X,
} from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { cn } from "@/lib/cn";

const navItems: Array<{
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
}> = [
  { href: "/admin", label: "Prehľad", icon: LayoutDashboard, exact: true },
  { href: "/admin/pouzivatelia", label: "Používatelia", icon: Users },
  { href: "/admin/weby", label: "Weby", icon: Globe2 },
  { href: "/admin/objednavky", label: "Objednávky", icon: CreditCard },
  { href: "/admin/domeny", label: "Domény", icon: Globe2 },
  { href: "/admin/ai-pouzitie", label: "AI použitie", icon: Bot },
  { href: "/admin/audit", label: "Audit", icon: ClipboardList },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="sidebar-nav" aria-label="Administrácia">
      <div className="nav-group">
        <p className="nav-label">Prevádzka</p>
        {navItems.map((item) => {
          const active = item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              className={cn("side-link", active && "side-link--active")}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
            >
              <Icon size={16} aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function AdminShell({ fullName, children }: { fullName: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="app-shell admin-shell">
      <aside className="sidebar" aria-label="Admin navigácia">
        <div className="brand-row">
          <Image src="/brand/logo-horizontal.svg" alt="WebPreKandidata.sk" width={168} height={34} priority />
          <span className="admin-badge"><Shield size={12} aria-hidden="true" /> Admin</span>
        </div>
        <NavLinks />
        <div className="sidebar-footer">
          <div className="account-button" aria-hidden="true">
            <span className="account-avatar"><Shield size={18} /></span>
            <span>
              <strong>{fullName || "Administrátor"}</strong>
              <small>Interný admin</small>
            </span>
          </div>
          <form action={logoutAction}>
            <button className="side-link side-link--button" type="submit">
              <LogOut size={16} aria-hidden="true" />
              <span>Odhlásiť sa</span>
            </button>
          </form>
        </div>
      </aside>

      <div className="app-main">
        <header className="mobile-header">
          <button className="icon-button" type="button" aria-label="Otvoriť menu" onClick={() => setOpen(true)}>
            <Menu size={20} />
          </button>
          <strong>Admin</strong>
          <form action={logoutAction}>
            <button className="icon-button" type="submit" aria-label="Odhlásiť sa"><LogOut size={18} /></button>
          </form>
        </header>
        {open && (
          <div className="mobile-drawer" role="dialog" aria-modal="true" aria-label="Admin menu">
            <div className="mobile-drawer__panel">
              <div className="brand-row">
                <Image src="/brand/logo-horizontal.svg" alt="WebPreKandidata.sk" width={150} height={30} />
                <button className="icon-button" type="button" aria-label="Zavrieť menu" onClick={() => setOpen(false)}>
                  <X size={18} />
                </button>
              </div>
              <NavLinks onNavigate={() => setOpen(false)} />
            </div>
            <button className="mobile-drawer__backdrop" type="button" aria-label="Zavrieť" onClick={() => setOpen(false)} />
          </div>
        )}
        <div className="page-container page-container--wide admin-page">{children}</div>
      </div>
    </div>
  );
}
