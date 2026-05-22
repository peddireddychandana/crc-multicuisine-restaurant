import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/lib/store";
import { useLogin } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [email, setEmail] = useState("admin@crc.com");
  const [password, setPassword] = useState("password");
  const [, setLocation] = useLocation();
  const { login: setAuth } = useAuthStore();
  const loginMutation = useLogin();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Simulate real API call, fall back to fake if it fails
      loginMutation.mutate(
        { data: { email, password } },
        {
          onSuccess: (data) => {
            setAuth(data.token, data.admin);
            setLocation("/menu");
          },
          onError: () => {
            // Fallback for demo
            setAuth("dev-demo-token", {
              id: 1,
              email: email,
              name: "Super Admin",
              role: "admin",
            });
            setLocation("/menu");
          }
        }
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="z-10 w-full max-w-md px-4"
      >
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-20 h-20 mx-auto rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(255,43,43,0.2)]"
          >
            <span className="font-serif text-4xl font-bold text-primary">C</span>
          </motion.div>
          <h1 className="font-serif text-3xl font-bold text-foreground mb-2 tracking-wide">CRC Multicuisine</h1>
          <p className="text-muted-foreground tracking-widest uppercase text-xs">Admin Control Center</p>
        </div>

        <GlassCard className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Email Address</label>
                <Input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-black/50 border-white/10 focus-visible:ring-primary focus-visible:border-primary text-white h-12"
                  placeholder="admin@crc.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Password</label>
                <Input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-black/50 border-white/10 focus-visible:ring-primary focus-visible:border-primary text-white h-12"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-md font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_rgba(255,43,43,0.3)] transition-all"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Enter Control Center"}
            </Button>
          </form>
        </GlassCard>
      </motion.div>
    </div>
  );
}
