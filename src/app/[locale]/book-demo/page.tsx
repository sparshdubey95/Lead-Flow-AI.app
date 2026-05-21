import { Link } from "@/i18n/routing"
import { ModeToggle } from "@/components/theme-toggle"
import { ArrowLeft } from "lucide-react"

export default function BookDemoPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="w-full border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="TryAssistly.AI Logo" className="w-8 h-8 rounded-md object-cover" />
            <span className="font-serif font-bold text-xl tracking-tight">TryAssistly.AI</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm font-medium flex items-center hover:text-primary transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
            <ModeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center py-16 px-4">
        <div className="text-center max-w-2xl mb-12">
          <h1 className="font-serif text-4xl md:text-5xl font-medium mb-4">See TryAssistly in Action</h1>
          <p className="text-muted-foreground text-lg">
            Choose a time below to see how our AI receptionist can automate your workflow and catch every missed patient.
          </p>
        </div>

        {/* Calendar Embed Placeholder */}
        <div className="w-full max-w-4xl bg-white dark:bg-black/40 border border-border/50 rounded-2xl shadow-xl overflow-hidden min-h-[700px] flex flex-col">
          {/* Replace this div with your actual Cal.com or Calendly embed code */}
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-muted/20">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-serif font-medium mb-2">Calendar Embed Area</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              Paste your Cal.com or Calendly iframe here. It will perfectly fill this beautiful rounded container.
            </p>
            
            <code className="bg-background border border-border/50 p-4 rounded-lg text-sm text-left block w-full max-w-lg overflow-x-auto">
              {`<iframe 
  src="https://cal.com/your-link" 
  width="100%" 
  height="100%" 
  frameBorder="0"
></iframe>`}
            </code>
          </div>
        </div>
      </main>
    </div>
  )
}
