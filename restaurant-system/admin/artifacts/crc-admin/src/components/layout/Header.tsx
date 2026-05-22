import { Menu } from "lucide-react";

export function Header({ title, onMenuToggle }: { title: string; onMenuToggle: () => void }) {
  return (
    <header className="h-20 border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-lg transition-all"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-lg sm:text-xl lg:text-2xl font-serif font-bold text-foreground tracking-wide">{title}</h2>
      </div>
    </header>
  );
}
