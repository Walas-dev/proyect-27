// src/components/admin/LoginForm.tsx
"use client";

import { useActionState } from "react";
import { login } from "@/app/admin/actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <form
      action={action}
      className="flex w-full max-w-sm flex-col gap-4 rounded-3xl bg-secondary p-6 shadow-xl ring-1 ring-primary/10"
    >
      <h1 className="font-display text-3xl font-semibold text-primary">Panel de administración</h1>

      <div>
        <label htmlFor="password" className="text-sm font-bold text-primary">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="mt-1 w-full rounded-xl bg-white p-3 text-base ring-1 ring-primary/20 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {state?.error && (
        <p role="alert" className="text-sm font-semibold text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="min-h-12 rounded-full bg-primary px-6 font-bold text-secondary shadow-md disabled:opacity-50"
      >
        {pending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}