import { AuthForm } from "./auth-form"
import Link from "next/link"
import { ModeToggle } from "@/components/theme-toggle"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="w-full border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <span className="text-primary-foreground font-serif font-bold text-lg">L</span>
            </div>
            <span className="font-serif font-bold text-xl tracking-tight">LeadGate.AI</span>
          </Link>
          <ModeToggle />
        </div>
      </header>
      
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <AuthForm />
        </div>
      </main>
    </div>
  )
}
