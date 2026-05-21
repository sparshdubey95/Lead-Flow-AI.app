import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Phone, MoreVertical, Send, Loader2, Zap } from 'lucide-react';

const leads = [
  { id: 1, name: 'Elena Rodriguez', msg: 'Necesito una cita para el martes.', time: '10:42 AM', unread: true, tags: ['Hot Lead', 'Spanish'] },
  { id: 2, name: 'Michael Chen', msg: 'Do you accept international insurance?', time: '09:15 AM', unread: false, tags: ['New'] },
  { id: 3, name: 'Sarah Jenkins', msg: 'Thanks, I will be there at 3.', time: 'Yesterday', unread: false, tags: [] },
];

export default function InboxPage() {
  return (
    <div className="flex h-full w-full bg-background">
      
      {/* Left Column: Leads List */}
      <div className="w-full border-r sm:w-80 md:w-96 lg:block flex-shrink-0 flex flex-col h-full bg-card">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold tracking-tight">Active Leads</h2>
          <Input placeholder="Search messages..." className="mt-4 bg-muted border-none" />
        </div>
        <ScrollArea className="flex-1">
          <div className="flex flex-col">
            {leads.map((lead) => (
              <button 
                key={lead.id} 
                className={`flex flex-col gap-2 p-4 border-b text-left transition-colors hover:bg-muted/50 ${lead.id === 1 ? 'bg-muted/50' : ''}`}
              >
                <div className="flex items-start justify-between w-full">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{lead.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">{lead.name}</span>
                      <span className="text-xs text-muted-foreground truncate w-40">{lead.msg}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs text-muted-foreground">{lead.time}</span>
                    {lead.unread && <span className="h-2 w-2 rounded-full bg-primary" />}
                  </div>
                </div>
                <div className="flex gap-1 pl-12 mt-1">
                  {lead.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Right Column: Chat Window */}
      <div className="hidden flex-1 flex-col h-full sm:flex bg-muted/20">
        {/* Chat Header */}
        <div className="flex h-16 items-center justify-between border-b px-6 bg-card">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>ER</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-semibold">Elena Rodriguez</span>
              <span className="text-xs text-green-500">Online via WhatsApp</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon"><Phone className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
          </div>
        </div>

        {/* Chat Messages */}
        <ScrollArea className="flex-1 p-6">
          <div className="flex flex-col gap-4">
            
            {/* Lead Message */}
            <div className="flex w-max max-w-[75%] flex-col gap-2 rounded-lg bg-muted px-4 py-3 text-sm">
              <p>Hola! Necesito una cita para el martes si es posible. Mi muela me duele mucho.</p>
              <span className="text-[10px] text-muted-foreground self-end">10:42 AM</span>
            </div>

            {/* AI Response Bubble */}
            <div className="flex w-max max-w-[75%] self-end flex-col gap-2 rounded-lg bg-primary px-4 py-3 text-sm text-primary-foreground">
              <p>¡Hola Elena! Lamento mucho escuchar que tienes dolor. Sí, tenemos disponibilidad este martes. ¿Prefieres por la mañana (10:00 AM) o por la tarde (3:30 PM)?</p>
              <div className="flex items-center justify-end gap-1">
                <Zap className="h-3 w-3 opacity-70" />
                <span className="text-[10px] opacity-70">10:43 AM • AI Auto-Reply</span>
              </div>
            </div>

            {/* AI Processing State indicator */}
            <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm py-4">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>TryAssistly AI is analyzing incoming voice note...</span>
            </div>

          </div>
        </ScrollArea>

        {/* Chat Input (Read-only aesthetic for CRM) */}
        <div className="p-4 border-t bg-card">
          <div className="flex w-full items-center space-x-2">
            <Input 
              type="text" 
              placeholder="AI is handling this conversation... Type to override." 
              className="flex-1"
            />
            <Button type="submit" size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
    </div>
  );
}
