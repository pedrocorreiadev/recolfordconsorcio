"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AdminLoginForm() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });
    setLoading(false);
    if (!response.ok) return setError("Identificação, senha ou acesso ainda não configurado.");
    router.replace("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mt-7 space-y-4">
      <label><span className="mb-2 block text-sm font-bold">Identificação</span><Input value={identifier} onChange={(event) => setIdentifier(event.target.value)} autoComplete="username" className="h-12 border-white/15 bg-white/10 text-white placeholder:text-white/35" placeholder="Digite sua identificação" /></label>
      <label><span className="mb-2 block text-sm font-bold">Senha</span><Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" className="h-12 border-white/15 bg-white/10 text-white placeholder:text-white/35" placeholder="Digite sua senha" /></label>
      {error && <p role="alert" className="text-sm font-semibold text-red-300">{error}</p>}
      <Button type="submit" disabled={loading} className="h-12 w-full bg-[#f5b942] font-extrabold text-[#09234a] hover:bg-[#ffd16d]">{loading ? <Loader2 className="animate-spin" /> : <KeyRound />} Entrar</Button>
    </form>
  );
}
