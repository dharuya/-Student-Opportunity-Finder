"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/lib/store";
import { toast } from "@/hooks/use-toast";
import type { SessionUser } from "@/lib/types";
import { GraduationCap, Loader2, Info } from "lucide-react";

interface FieldErrors {
  [key: string]: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function AuthModal() {
  const { authModalOpen, setAuthModalOpen, setUser } = useAppStore();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  // login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  // register
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  useEffect(() => {
    if (authModalOpen) {
      setFormError("");
      setFieldErrors({});
      setLoading(false);
    }
  }, [authModalOpen, tab]);

  const applyAuthResponse = async (res: Response, endpoint: string, payload: object) => {
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setFormError(data.error ?? "Something went wrong. Please try again.");
      setFieldErrors(data.errors ?? {});
      return;
    }
    setUser(data.user as SessionUser);
    setAuthModalOpen(false);
    toast({
      title: endpoint === "login" ? "Welcome back!" : "Account created",
      description: `You are signed in as ${data.user.name}.`,
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFieldErrors({});
    const errs: FieldErrors = {};
    if (!EMAIL_RE.test(loginEmail)) errs.email = "Enter a valid email address.";
    if (loginPassword.length < 1) errs.password = "Enter your password.";
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail.trim(), password: loginPassword }),
      });
      await applyAuthResponse(res, "login", {});
    } catch {
      setFormError("Network problem — please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFieldErrors({});
    const errs: FieldErrors = {};
    if (regName.trim().length < 2) errs.name = "Enter your full name.";
    if (!EMAIL_RE.test(regEmail)) errs.email = "Enter a valid email address.";
    if (regPassword.length < 8) errs.password = "Use at least 8 characters.";
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: regName.trim(), email: regEmail.trim(), password: regPassword }),
      });
      await applyAuthResponse(res, "register", {});
    } catch {
      setFormError("Network problem — please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field: string) =>
    fieldErrors[field] ? "border-red-400 focus-visible:ring-red-300" : "";

  const FieldError = ({ field }: { field: string }) =>
    fieldErrors[field] ? (
      <p className="mt-1 text-xs text-red-600" role="alert">
        {fieldErrors[field]}
      </p>
    ) : null;

  return (
    <Dialog open={authModalOpen} onOpenChange={setAuthModalOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-navy-900">
            <GraduationCap className="h-5 w-5 text-teal-600" aria-hidden />
            {tab === "login" ? "Sign in to OpportunityHub" : "Create your free account"}
          </DialogTitle>
          <DialogDescription>
            Save opportunities, track deadlines and get personalised matches.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as "login" | "register")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Sign in</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4" noValidate>
              {formError && (
                <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                  {formError}
                </p>
              )}
              <div>
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={inputClass("email")}
                />
                <FieldError field="email" />
              </div>
              <div>
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Your password"
                  className={inputClass("password")}
                />
                <FieldError field="password" />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-navy-900 text-white hover:bg-navy-800"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />}
                Sign in
              </Button>
              <div className="flex gap-2 rounded-md bg-navy-50 p-3 text-xs text-navy-700">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-600" aria-hidden />
                <span>
                  Demo accounts — student: <b>student@demo.in / Student@1234</b> · admin:{" "}
                  <b>admin@opportunityhub.in / Admin@1234</b>
                </span>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-4" noValidate>
              {formError && (
                <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                  {formError}
                </p>
              )}
              <div>
                <Label htmlFor="reg-name">Full name</Label>
                <Input
                  id="reg-name"
                  autoComplete="name"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Ananya Sharma"
                  className={inputClass("name")}
                />
                <FieldError field="name" />
              </div>
              <div>
                <Label htmlFor="reg-email">Email</Label>
                <Input
                  id="reg-email"
                  type="email"
                  autoComplete="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={inputClass("email")}
                />
                <FieldError field="email" />
              </div>
              <div>
                <Label htmlFor="reg-password">Password</Label>
                <Input
                  id="reg-password"
                  type="password"
                  autoComplete="new-password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className={inputClass("password")}
                />
                <FieldError field="password" />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-teal-600 text-white hover:bg-teal-700"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />}
                Create account
              </Button>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Your details are used only to match you with opportunities on this platform.
                Providing profile information is voluntary.
              </p>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
