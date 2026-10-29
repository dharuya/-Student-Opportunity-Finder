"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppStore } from "@/lib/store";
import { toast } from "@/hooks/use-toast";
import type { ViewName } from "@/lib/types";
import {
  GraduationCap,
  Home,
  Compass,
  Bell,
  User,
  Bookmark,
  ShieldCheck,
  Menu,
  LogOut,
  ChevronDown,
} from "lucide-react";

const NAV_ITEMS: { view: ViewName; label: string; icon: React.ElementType }[] = [
  { view: "home", label: "Home", icon: Home },
  { view: "explore", label: "Explore", icon: Compass },
  { view: "deadlines", label: "Deadlines", icon: Bell },
  { view: "profile", label: "My Profile", icon: User },
  { view: "saved", label: "Saved", icon: Bookmark },
  { view: "admin", label: "Admin", icon: ShieldCheck },
];

export function Navbar() {
  const { view, setView, user, setUser, setAuthModalOpen } = useAppStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const go = (v: ViewName) => {
    setView(v);
    setMobileOpen(false);
  };

  const signOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      toast({ title: "Signed out", description: "You have been signed out safely." });
      setView("home");
    } catch {
      toast({
        title: "Could not sign out",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-md focus:bg-navy-900 focus:px-3 focus:py-2 focus:text-sm focus:text-white"
      >
        Skip to main content
      </a>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <button
          onClick={() => go("home")}
          className="flex items-center gap-2.5"
          aria-label="OpportunityHub home"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-900">
            <GraduationCap className="h-5 w-5 text-teal-400" aria-hidden />
          </span>
          <span className="text-lg font-bold tracking-tight text-navy-900">
            Opportunity<span className="text-teal-600">Hub</span>
          </span>
        </button>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          {NAV_ITEMS.map(({ view: v, label, icon: Icon }) => (
            <button
              key={v}
              onClick={() => go(v)}
              aria-current={view === v ? "page" : undefined}
              className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                view === v
                  ? "bg-navy-50 text-navy-900"
                  : "text-slate-600 hover:bg-slate-50 hover:text-navy-900"
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 border-slate-200" aria-label="Account menu">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="hidden max-w-28 truncate sm:inline">{user.name.split(" ")[0]}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" aria-hidden />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="text-sm font-semibold">{user.name}</div>
                  <div className="truncate text-xs font-normal text-muted-foreground">{user.email}</div>
                  <div className="mt-1 text-xs font-medium text-teal-700">
                    {user.role === "ADMIN" ? "Administrator" : "Student account"}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user.role === "ADMIN" && (
                  <DropdownMenuItem onClick={() => go("admin")}>
                    <ShieldCheck className="mr-2 h-4 w-4" aria-hidden /> Admin Dashboard
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => go("profile")}>
                  <User className="mr-2 h-4 w-4" aria-hidden /> My Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => go("saved")}>
                  <Bookmark className="mr-2 h-4 w-4" aria-hidden /> Saved Opportunities
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} variant="destructive">
                  <LogOut className="mr-2 h-4 w-4" aria-hidden /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button
                variant="ghost"
                className="text-navy-800 hover:bg-navy-50"
                onClick={() => setAuthModalOpen(true)}
              >
                Sign in
              </Button>
              <Button
                className="bg-teal-600 text-white hover:bg-teal-700"
                onClick={() => setAuthModalOpen(true)}
              >
                Create free account
              </Button>
            </div>
          )}

          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" aria-hidden />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2 text-navy-900">
                  <GraduationCap className="h-5 w-5 text-teal-600" aria-hidden /> OpportunityHub
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-2 flex flex-col gap-1 px-2" aria-label="Mobile navigation">
                {NAV_ITEMS.map(({ view: v, label, icon: Icon }) => (
                  <button
                    key={v}
                    onClick={() => go(v)}
                    className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium ${
                      view === v ? "bg-navy-50 text-navy-900" : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="h-4 w-4" aria-hidden /> {label}
                  </button>
                ))}
                <div className="mt-3 border-t border-slate-100 pt-3">
                  {user ? (
                    <Button variant="outline" className="w-full justify-start" onClick={signOut}>
                      <LogOut className="mr-2 h-4 w-4" aria-hidden /> Sign out ({user.name.split(" ")[0]})
                    </Button>
                  ) : (
                    <Button
                      className="w-full bg-teal-600 text-white hover:bg-teal-700"
                      onClick={() => {
                        setMobileOpen(false);
                        setAuthModalOpen(true);
                      }}
                    >
                      Sign in / Create account
                    </Button>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
