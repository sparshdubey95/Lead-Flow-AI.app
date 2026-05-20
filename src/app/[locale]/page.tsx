"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { PhoneMissed, MessageSquare, Mic, Globe, Calendar, Mail, Smartphone, ArrowRight, Menu, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "@/i18n/routing";
import { ModeToggle } from "@/components/theme-toggle";

const pricingTiers = [
  {
    name: "Monthly",
    price: "$39",
    period: "/ month",
    description: "Perfect for single clinics getting started with AI automation.",
    features: ["WhatsApp CRM integration", "AI Auto-replies", "Voice-note transcription", "Basic Analytics"],
    ctaText: "Get Started",
    isRecommended: false
  },
  {
    name: "Quarterly",
    price: "$99",
    period: "/ 3 months",
    description: "Our most popular plan. Save money and secure seamless automation.",
    features: ["Everything in Monthly", "Multi-lingual FAQ handling", "Follow-up sequences", "Priority AI processing"],
    ctaText: "Buy Now",
    isRecommended: true
  }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <span className="text-primary-foreground font-serif font-bold text-lg">L</span>
            </div>
            <span className="font-serif font-bold text-xl tracking-tight">LeadGate.AI</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="/#product" className="transition-colors hover:text-primary/80">Product</Link>
            <Link href="/#solutions" className="transition-colors hover:text-primary/80">Solutions</Link>
            <Link href="/#pricing" className="transition-colors hover:text-primary/80">Pricing</Link>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <ModeToggle />
            <Link href="/login" className="text-sm font-medium hover:underline underline-offset-4">Login</Link>
            <Link href="/login">
              <Button className="rounded-full px-6">Get Started</Button>
            </Link>
          </div>
          
          <div className="md:hidden flex items-center gap-2">
            <ModeToggle />
            <Button variant="ghost" size="icon">
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex flex-col items-center w-full">
        {/* Hero Section */}
        <section className="w-full max-w-6xl mx-auto px-4 pt-32 pb-20 text-center flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 text-primary text-sm font-medium mb-8 border border-primary/10"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Introducing LeadGate 2.0
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-serif text-5xl md:text-7xl lg:text-8xl font-medium tracking-tight text-balance max-w-5xl leading-[1.1]"
          >
            What if speaking was enough? <br />
            <span className="text-muted-foreground/60 italic">Catch every missed patient.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl text-balance font-sans leading-relaxed"
          >
            LeadGate AI acts as a 24/7 receptionist via WhatsApp. Automatically engage leads, answer queries, and book appointments through natural voice and text conversations.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row gap-4"
          >
            <Link href="/login" className="group">
              <Button size="lg" className="rounded-full px-8 h-14 text-base cursor-pointer">
                Get Started
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/book-demo">
              <Button size="lg" variant="outline" className="rounded-full px-8 h-14 text-base bg-transparent border-border/60 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer">
                Book a Demo
              </Button>
            </Link>
          </motion.div>
        </section>

        {/* Marquee Section (Product) */}
        <section id="product" className="w-full py-12 overflow-hidden bg-white/40 dark:bg-black/40 border-y border-border/40 backdrop-blur-sm mt-12 scroll-mt-20">
          <p className="text-center text-sm font-medium text-muted-foreground mb-8 uppercase tracking-widest">Seamlessly integrates with your workflow</p>
          <div className="relative flex flex-col gap-4 max-w-[100vw] overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
            
            <motion.div 
              animate={{ x: ["0%", "-50%"] }}
              transition={{ repeat: Infinity, ease: "linear", duration: 20 }}
              className="flex whitespace-nowrap gap-16 items-center w-max px-8"
            >
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex gap-16 items-center">
                  <div className="flex items-center gap-3 text-muted-foreground/60 grayscale hover:grayscale-0 transition-all opacity-60 hover:opacity-100">
                    <MessageSquare className="w-8 h-8" /> <span className="font-serif text-2xl font-medium">WhatsApp</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground/60 grayscale hover:grayscale-0 transition-all opacity-60 hover:opacity-100">
                    <Calendar className="w-8 h-8" /> <span className="font-serif text-2xl font-medium">Google Calendar</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground/60 grayscale hover:grayscale-0 transition-all opacity-60 hover:opacity-100">
                    <Mail className="w-8 h-8" /> <span className="font-serif text-2xl font-medium">Gmail</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground/60 grayscale hover:grayscale-0 transition-all opacity-60 hover:opacity-100">
                    <Smartphone className="w-8 h-8" /> <span className="font-serif text-2xl font-medium">iOS & Android</span>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Feature Grid Section (Solutions) */}
        <section id="solutions" className="w-full max-w-6xl mx-auto px-4 py-32 scroll-mt-20">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-5xl font-medium mb-6">Everything you need to scale</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Our AI handles the busywork so you can focus on what matters most: providing excellent care to your patients.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-white/60 dark:bg-black/40 backdrop-blur-xl border-border/50 hover:shadow-lg transition-all duration-300 group overflow-hidden cursor-default shadow-sm hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-300">
                  <PhoneMissed className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="font-serif text-2xl font-medium">Missed-Call Recovery</CardTitle>
                <CardDescription className="text-base pt-2 text-muted-foreground/80 font-sans leading-relaxed">
                  Never lose a lead again. Instantly follow up with missed calls via WhatsApp, engaging prospects while their intent is highest.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/60 dark:bg-black/40 backdrop-blur-xl border-border/50 hover:shadow-lg transition-all duration-300 group overflow-hidden cursor-default shadow-sm hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-300">
                  <MessageSquare className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="font-serif text-2xl font-medium">AI Auto-Replies</CardTitle>
                <CardDescription className="text-base pt-2 text-muted-foreground/80 font-sans leading-relaxed">
                  Provide instant, context-aware responses 24/7. Our AI learns from your business logic to answer questions accurately.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/60 dark:bg-black/40 backdrop-blur-xl border-border/50 hover:shadow-lg transition-all duration-300 group overflow-hidden cursor-default shadow-sm hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-300">
                  <Mic className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="font-serif text-2xl font-medium">Voice-Note Transcription</CardTitle>
                <CardDescription className="text-base pt-2 text-muted-foreground/80 font-sans leading-relaxed">
                  Patients prefer voice notes. LeadGate automatically transcribes incoming voice messages and extracts actionable data.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/60 dark:bg-black/40 backdrop-blur-xl border-border/50 hover:shadow-lg transition-all duration-300 group overflow-hidden cursor-default shadow-sm hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-300">
                  <Globe className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="font-serif text-2xl font-medium">Multi-lingual FAQ</CardTitle>
                <CardDescription className="text-base pt-2 text-muted-foreground/80 font-sans leading-relaxed">
                  Break language barriers effortlessly. Automatically detect and reply in Spanish, German, French, and over 40 other languages.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="w-full py-32 bg-white/40 dark:bg-black/40 border-y border-border/40 backdrop-blur-sm scroll-mt-20">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="font-serif text-3xl md:text-5xl font-medium mb-6">Simple, transparent pricing</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Start capturing missed revenue today. No hidden fees, cancel anytime.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {pricingTiers.map((tier) => (
                <Card 
                  key={tier.name}
                  className={tier.isRecommended 
                    ? "bg-primary text-primary-foreground shadow-xl relative overflow-hidden" 
                    : "bg-white/60 dark:bg-black/40 backdrop-blur-xl border-border/50"}
                >
                  {tier.isRecommended && (
                    <div className="absolute top-0 right-0 bg-white/20 px-3 py-1 rounded-bl-xl text-xs font-medium uppercase tracking-wider">
                      Most Popular
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="font-serif text-3xl font-medium">{tier.name}</CardTitle>
                    <CardDescription className={tier.isRecommended ? "text-primary-foreground/80 text-base pt-2" : "text-base pt-2"}>
                      {tier.description}
                    </CardDescription>
                    <div className="mt-4">
                      <span className="text-5xl font-serif font-medium">{tier.price}</span>
                      <span className={tier.isRecommended ? "text-primary-foreground/80" : "text-muted-foreground"}>
                        {tier.period}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {tier.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-3">
                          <CheckCircle2 className={`w-5 h-5 ${tier.isRecommended ? "text-white" : "text-primary"}`} />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Link href="/login" className="w-full">
                      <Button 
                        variant={tier.isRecommended ? "default" : "outline"} 
                        className={tier.isRecommended 
                          ? "w-full rounded-full h-12 bg-white text-primary hover:bg-white/90" 
                          : "w-full rounded-full h-12"}
                      >
                        {tier.ctaText}
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      
      <footer className="border-t border-border/40 py-12 text-center text-muted-foreground bg-white/30 dark:bg-black/30 backdrop-blur-sm">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-6 h-6 bg-primary/20 rounded-md flex items-center justify-center">
            <span className="text-primary font-serif font-bold text-xs">L</span>
          </div>
          <span className="font-serif font-bold text-lg tracking-tight">LeadGate.AI</span>
        </div>
        <p className="text-sm font-sans">&copy; {new Date().getFullYear()} LeadGate.AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
