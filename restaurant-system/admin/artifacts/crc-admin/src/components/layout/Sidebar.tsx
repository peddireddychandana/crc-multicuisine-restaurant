import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  MenuSquare, 
  Tag, 
  Settings,
  LogOut,
  X
} from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { motion } from "framer-motion";

const NAV_ITEMS = [
  { href: "/menu", label: "Menu", icon: MenuSquare },
  { href: "/offers", label: "Offers", icon: Tag },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const [location] = useLocation();
  const { logout, admin } = useAuthStore();

  const sidebarContent = (
    <div className="w-[280px] h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Brand */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
            <span className="font-serif text-xl font-bold text-primary">C</span>
          </div>
          <div>
            <h1 className="font-serif text-lg font-bold text-foreground leading-tight tracking-wide">CRC</h1>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Multicuisine</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav Links */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        {NAV_ITEMS.map((item, index) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          
          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link href={item.href}>
                <div
                  onClick={() => onClose()}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-300",
                    isActive 
                      ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(255,43,43,0.1)]" 
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{item.label}</span>
                  {isActive && (
                    <motion.div 
                      layoutId="activeNavIndicator"
                      className="absolute left-0 w-1 h-8 bg-primary rounded-r-full"
                    />
                  )}
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center border border-white/10 overflow-hidden">
            {admin?.avatar ? (
              <img src={admin.avatar} alt="Admin" className="w-full h-full object-cover" />
            ) : (
              <span className="font-bold text-sm text-foreground">{admin?.name?.[0] || 'A'}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{admin?.name || 'Admin User'}</p>
            <p className="text-xs text-muted-foreground truncate">{admin?.role || 'Super Admin'}</p>
          </div>
          <button 
            onClick={logout}
            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar - fixed */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:z-30">
        {sidebarContent}
      </div>

      {/* Mobile sidebar - overlay */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </div>
    </>
  );
}
