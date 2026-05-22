import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { GlassCard } from "@/components/ui/glass-card";
import { useGetSettings, useUpdateSettings } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Save, Store, Clock, IndianRupee, Phone, MapPin, QrCode, Bell, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface SettingsForm {
  restaurant_name: string;
  opening_time: string;
  closing_time: string;
  tax_rate: string;
  delivery_enabled: boolean;
  delivery_radius: string;
  min_order_amount: string;
  contact_phone: string;
  contact_email: string;
  address: string;
  qr_enabled: boolean;
  notifications_enabled: boolean;
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-12 h-6 rounded-full transition-colors ${value ? "bg-[#FF2B2B]" : "bg-white/10"}`}
    >
      <span
        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform shadow ${value ? "translate-x-7" : "translate-x-1"}`}
      />
    </button>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <GlassCard className="p-6 space-y-5">
      <div className="flex items-center gap-2 pb-3 border-b border-white/5">
        <Icon className="w-5 h-5 text-[#FF2B2B]" />
        <h3 className="font-serif font-bold text-base text-foreground">{title}</h3>
      </div>
      {children}
    </GlassCard>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:grid sm:grid-cols-3 items-start sm:items-center gap-1.5 sm:gap-3">
      <label className="text-sm text-muted-foreground">{label}</label>
      <div className="w-full sm:col-span-2">{children}</div>
    </div>
  );
}

export default function Settings() {
  const { toast } = useToast();
  const { data: settings, isLoading } = useGetSettings();
  const updateSettings = useUpdateSettings();

  const [form, setForm] = useState<SettingsForm>({
    restaurant_name: "",
    opening_time: "10:00",
    closing_time: "23:00",
    tax_rate: "5",
    delivery_enabled: true,
    delivery_radius: "10",
    min_order_amount: "200",
    contact_phone: "",
    contact_email: "",
    address: "",
    qr_enabled: true,
    notifications_enabled: true,
  });

  useEffect(() => {
    if (settings) {
      setForm({
        restaurant_name: settings.restaurantName || "",
        opening_time: settings.openingTime || "10:00",
        closing_time: settings.closingTime || "23:00",
        tax_rate: String(settings.taxRate ?? 5),
        delivery_enabled: settings.deliveryEnabled ?? true,
        delivery_radius: String(settings.deliveryRadius ?? 10),
        min_order_amount: String(settings.minOrderAmount ?? 200),
        contact_phone: settings.contactPhone || "",
        contact_email: settings.contactEmail || "",
        address: settings.address || "",
        qr_enabled: settings.qrEnabled ?? true,
        notifications_enabled: settings.notificationsEnabled ?? true,
      });
    }
  }, [settings]);

  const f = (key: keyof SettingsForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [key]: e.target.value });

  const handleSave = () => {
    updateSettings.mutate(
      {
        data: {
          restaurantName: form.restaurant_name,
          openingTime: form.opening_time,
          closingTime: form.closing_time,
          taxRate: parseFloat(form.tax_rate),
          deliveryEnabled: form.delivery_enabled,
          deliveryRadius: parseFloat(form.delivery_radius),
          minOrderAmount: parseFloat(form.min_order_amount),
          contactPhone: form.contact_phone,
          contactEmail: form.contact_email,
          address: form.address,
          qrEnabled: form.qr_enabled,
          notificationsEnabled: form.notifications_enabled,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Settings saved successfully" });
        },
        onError: () => {
          toast({ title: "Failed to save settings", variant: "destructive" });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <Layout title="Restaurant Settings">
        <div className="space-y-6">
          {[...Array(4)].map((_, i) => (
            <GlassCard key={i} className="h-40 animate-pulse"><span /></GlassCard>
          ))}
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Restaurant Settings">
      <div className="space-y-6 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Section title="Restaurant Profile" icon={Store}>
            <Field label="Restaurant Name">
              <Input value={form.restaurant_name} onChange={f("restaurant_name")} className="bg-white/5 border-white/10" />
            </Field>
            <Field label="Address">
              <Input value={form.address} onChange={f("address")} placeholder="Full address" className="bg-white/5 border-white/10" />
            </Field>
          </Section>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Section title="Hours & Tax" icon={Clock}>
            <Field label="Opening Time">
              <Input type="time" value={form.opening_time} onChange={f("opening_time")} className="bg-white/5 border-white/10 w-full sm:w-40" />
            </Field>
            <Field label="Closing Time">
              <Input type="time" value={form.closing_time} onChange={f("closing_time")} className="bg-white/5 border-white/10 w-full sm:w-40" />
            </Field>
            <Field label="Tax Rate (%)">
              <Input type="number" value={form.tax_rate} onChange={f("tax_rate")} step="0.5" min="0" max="30" className="bg-white/5 border-white/10 w-full sm:w-32" />
            </Field>
          </Section>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Section title="Delivery Settings" icon={Truck}>
            <Field label="Enable Delivery">
              <Toggle value={form.delivery_enabled} onChange={(v) => setForm({ ...form, delivery_enabled: v })} />
            </Field>
            <Field label="Delivery Radius (km)">
              <Input type="number" value={form.delivery_radius} onChange={f("delivery_radius")} disabled={!form.delivery_enabled} className="bg-white/5 border-white/10 w-full sm:w-32" />
            </Field>
            <Field label="Min Order Amount (₹)">
              <Input type="number" value={form.min_order_amount} onChange={f("min_order_amount")} className="bg-white/5 border-white/10 w-full sm:w-40" />
            </Field>
          </Section>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Section title="Contact" icon={Phone}>
            <Field label="Phone">
              <Input value={form.contact_phone} onChange={f("contact_phone")} placeholder="+91 98765 43210" className="bg-white/5 border-white/10" />
            </Field>
            <Field label="Email">
              <Input type="email" value={form.contact_email} onChange={f("contact_email")} placeholder="contact@restaurant.com" className="bg-white/5 border-white/10" />
            </Field>
          </Section>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Section title="Features" icon={Bell}>
            <Field label="QR Code Ordering">
              <div className="flex items-center gap-3">
                <Toggle value={form.qr_enabled} onChange={(v) => setForm({ ...form, qr_enabled: v })} />
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <QrCode className="w-4 h-4" /> Allow table QR ordering
                </span>
              </div>
            </Field>
            <Field label="Notifications">
              <div className="flex items-center gap-3">
                <Toggle value={form.notifications_enabled} onChange={(v) => setForm({ ...form, notifications_enabled: v })} />
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Bell className="w-4 h-4" /> Enable admin notifications
                </span>
              </div>
            </Field>
          </Section>
        </motion.div>

        <div className="flex justify-end pb-6">
          <Button
            onClick={handleSave}
            disabled={updateSettings.isPending}
            className="bg-[#FF2B2B] hover:bg-[#cc2222] text-white gap-2 px-8"
          >
            <Save className="w-4 h-4" />
            {updateSettings.isPending ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>
    </Layout>
  );
}
