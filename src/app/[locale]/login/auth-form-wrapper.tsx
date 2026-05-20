"use client"

import dynamic from "next/dynamic"

const AuthForm = dynamic(() => import("./auth-form").then(mod => mod.AuthForm), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[420px] rounded-xl bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-border/50 shadow-xl animate-pulse" />
  ),
})

export function AuthFormWrapper() {
  return <AuthForm />
}
