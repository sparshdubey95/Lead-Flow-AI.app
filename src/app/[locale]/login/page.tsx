import { AuthFormWrapper } from "./auth-form-wrapper"
import { Link } from "@/i18n/routing"
import { ModeToggle } from "@/components/theme-toggle"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="w-full border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="TryAssistly.AI Logo" className="w-8 h-8 rounded-md object-cover" />
            <span className="font-serif font-bold text-xl tracking-tight">TryAssistly.AI</span>
          </Link>
          <ModeToggle />
        </div>
      </header>
      
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <AuthFormWrapper />
        </div>
      </main>
    </div>
  )
}
