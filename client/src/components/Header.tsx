import { Car, Box } from "lucide-react";

export function Header() {
  return (
    <header className="border-b border-border/40 bg-card/50 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full group-hover:bg-primary/40 transition-all duration-500" />
            <div className="relative p-2 bg-gradient-to-br from-secondary to-background rounded-lg border border-border group-hover:border-primary/50 transition-colors">
              <Car className="w-6 h-6 text-primary" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-foreground tracking-wider group-hover:text-primary transition-colors">
              BEAM<span className="text-primary">2</span>MESH
            </h1>
            <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest leading-none">
              Model Converter
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono">
            <Box className="w-4 h-4 text-primary" />
            <span>SUPPORTING DAE v1.4+</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>SYSTEM ONLINE</span>
          </div>
        </div>
      </div>
    </header>
  );
}
