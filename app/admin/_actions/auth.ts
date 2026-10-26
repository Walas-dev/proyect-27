// src/app/admin/_actions/auth.ts
"use server";

import { redirect } from "next/navigation";
import { checkPassword, createSession, destroySession } from "@/lib/admin/auth";

export async function login(
  _prev: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string } | undefined> {
  const password = String(formData.get("password") ?? "");
  if (!checkPassword(password)) {
    await new Promise((r) => setTimeout(r, 700)); // frena los intentos repetidos
    return { error: "Contraseña incorrecta." };
  }
  await createSession();
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}