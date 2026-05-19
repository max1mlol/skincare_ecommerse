"use client";
// admin/settings/page.js: Админ самбарын ерөнхий тохиргооны хуудас.
// Эндээс админ өөрийн профайл, дэлгүүрийн мэдээлэл, мэдэгдэл хүлээн авах суваг, банкны мэдээлэл, болон харагдацын тохиргоо зэргийг удирдах боломжтой.
import { useState } from "react";
import {
  Save,
  Store,
  Bell,
  Shield,
  Palette,
  Globe,
  CreditCard,
  User,
} from "lucide-react";
import { useSession } from "@/context/SessionContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

// Тохиргооны хажуугийн цэсэнд харагдах хэсгүүдийн жагсаалт
const SECTIONS = [
  { id: "profile", label: "Миний профайл", icon: User },
  { id: "store", label: "Дэлгүүр", icon: Store },
  { id: "notif", label: "Мэдэгдэл", icon: Bell },
  { id: "payment", label: "Төлбөр", icon: CreditCard },
  { id: "security", label: "Аюулгүй байдал", icon: Shield },
  { id: "display", label: "Харагдац", icon: Palette },
  { id: "locale", label: "Хэл & Бүс", icon: Globe },
];

// Section: Тохиргооны хэсэг бүрийг бүрхэж харуулах компонент
function Section({ title, description, children }) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-5">
      <div>
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      <Separator />
      {children}
    </div>
  );
}

// ToggleRow: Асааж унтраах товчлуур бүхий тохиргооны мөр (Жишээ нь мэдэгдлийн тохиргоо)
function ToggleRow({ label, description, checked, onCheckedChange }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

export default function AdminSettingsPage() {
  const { user, refetch } = useSession();
  const [activeSection, setActiveSection] = useState("profile"); // Идэвхтэй байгаа тохиргооны хэсэг
  const [saved, setSaved] = useState(false); // Хадгалалт амжилттай болсон эсэх
  const [isEditingProfile, setIsEditingProfile] = useState(false); // Профайл засаж буй эсэх
  const [profileSaving, setProfileSaving] = useState(false); // Профайл хадгалж буй явц
  
  const [profile, setProfile] = useState({
    firstName: user?.first_name ?? "",
    lastName: user?.last_name ?? "",
    phone: user?.phone ?? "",
  });

  const [store, setStore] = useState({
    name: "AURA SKIN",
    email: "hello@auraskin.mn",
    phone: "7700-0000",
    address: "Улаанбаатар хот, Хан-Уул дүүрэг",
    description: "Дэлхийн шилдэг арьс арчилгааны брэндүүдийн албан ёсны гэрээт борлуулагч дэлгүүр.",
  });

  const [notifs, setNotifs] = useState({
    orderEmail: true,
    reviewEmail: true,
    lowStockEmail: true,
    marketingEmail: false,
  });

  const [security, setSecurity] = useState({
    twoFactor: false,
    loginAlerts: true,
    sessionTimeout: true,
  });

  const [display, setDisplay] = useState({
    darkMode: false,
    compactTable: false,
    showRevenue: true,
  });

  // handleSave: Тохиргоог хадгалж буй үеийн үзүүлэн (хуурамч хүлээлт)
  async function handleSave() {
    await new Promise((r) => setTimeout(r, 600)); // 0.6 секунд хүлээлгэнэ
    setSaved(true);
    setTimeout(() => setSaved(false), 2000); // 2 секундын дараа амжилтын зурвасыг арилгана
  }

  // handleProfileSave: Админы хувийн мэдээллийг өөрчилж хадгалах функц
  async function handleProfileSave() {
    if (!user) return;
    setProfileSaving(true);
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (res.ok) {
        await refetch(); // Сессийн мэдээллийг дахин уншиж UI-ийг шинэчилнэ
        setIsEditingProfile(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProfileSaving(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Тохиргоо</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Дэлгүүрийн ерөнхий тохиргоо
          </p>
        </div>
        {activeSection === "profile" ? (
          isEditingProfile && (
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => { setIsEditingProfile(false); setProfile({ firstName: user?.first_name ?? "", lastName: user?.last_name ?? "", phone: user?.phone ?? "" }); }} className="rounded-full h-9 text-sm">
                Цуцлах
              </Button>
              <Button onClick={handleProfileSave} disabled={profileSaving} className="rounded-full gap-2 h-9 text-sm">
                <Save size={14} />
                {profileSaving ? "Хадгалж байна..." : (saved ? "Хадгалагдлаа ✓" : "Хадгалах")}
              </Button>
            </div>
          )
        ) : (
          <Button
            onClick={handleSave}
            className="rounded-full gap-2 h-9 text-sm"
            id="save-settings-btn"
          >
            <Save size={14} />
            {saved ? "Хадгалагдлаа ✓" : "Хадгалах"}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Хажуугийн цэс */}
        <nav className="lg:col-span-1 space-y-1">
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                activeSection === id
                  ? "bg-foreground text-background font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </nav>

        {/* Сонгогдсон хэсгийн тохиргооны агуулга */}
        <div className="lg:col-span-3 space-y-5">
          {activeSection === "profile" && (
            <div className="bg-card border border-border rounded-xl p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">Хувийн мэдээлэл</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Админ профайлын мэдээлэл</p>
                </div>
                {!isEditingProfile && (
                  <Button variant="ghost" size="sm" onClick={() => setIsEditingProfile(true)}>
                    Өөрчлөх
                  </Button>
                )}
              </div>
              <Separator />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="p-fname">Нэр</Label>
                  <Input id="p-fname" value={profile.firstName} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} disabled={!isEditingProfile} className={`rounded-xl h-9 text-sm ${!isEditingProfile ? 'opacity-70 bg-muted/50' : ''}`} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="p-lname">Овог</Label>
                  <Input id="p-lname" value={profile.lastName} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} disabled={!isEditingProfile} className={`rounded-xl h-9 text-sm ${!isEditingProfile ? 'opacity-70 bg-muted/50' : ''}`} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="p-email">Имэйл</Label>
                  <Input id="p-email" type="email" value={user?.email || ""} disabled className="rounded-xl h-9 text-sm opacity-60 bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="p-phone">Утас</Label>
                  <Input id="p-phone" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} disabled={!isEditingProfile} className={`rounded-xl h-9 text-sm ${!isEditingProfile ? 'opacity-70 bg-muted/50' : ''}`} />
                </div>
              </div>
            </div>
          )}

          {activeSection === "store" && (
            <Section
              title="Дэлгүүрийн мэдээлэл"
              description="Харилцагчид харагдах үндсэн мэдээлэл"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="s-name">Дэлгүүрийн нэр</Label>
                  <Input
                    id="s-name"
                    value={store.name}
                    onChange={(e) =>
                      setStore({ ...store, name: e.target.value })
                    }
                    className="rounded-xl h-9 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="s-email">Имэйл</Label>
                  <Input
                    id="s-email"
                    type="email"
                    value={store.email}
                    onChange={(e) =>
                      setStore({ ...store, email: e.target.value })
                    }
                    className="rounded-xl h-9 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="s-phone">Утас</Label>
                  <Input
                    id="s-phone"
                    value={store.phone}
                    onChange={(e) =>
                      setStore({ ...store, phone: e.target.value })
                    }
                    className="rounded-xl h-9 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="s-address">Хаяг</Label>
                  <Input
                    id="s-address"
                    value={store.address}
                    onChange={(e) =>
                      setStore({ ...store, address: e.target.value })
                    }
                    className="rounded-xl h-9 text-sm"
                  />
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <Label htmlFor="s-desc">Тайлбар</Label>
                  <textarea
                    id="s-desc"
                    rows={3}
                    value={store.description}
                    onChange={(e) =>
                      setStore({ ...store, description: e.target.value })
                    }
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                </div>
              </div>
            </Section>
          )}

          {activeSection === "notif" && (
            <Section
              title="Мэдэгдлийн тохиргоо"
              description="Ямар үед имэйл хүлээн авахаа тохируулна"
            >
              <div className="space-y-5">
                <ToggleRow
                  label="Захиалгын мэдэгдэл"
                  description="Шинэ захиалга ирэх бүрд имэйл авах"
                  checked={notifs.orderEmail}
                  onCheckedChange={(v) =>
                    setNotifs({ ...notifs, orderEmail: v })
                  }
                />
                <Separator />
                <ToggleRow
                  label="Сэтгэгдлийн мэдэгдэл"
                  description="Шинэ сэтгэгдэл ирэх бүрд"
                  checked={notifs.reviewEmail}
                  onCheckedChange={(v) =>
                    setNotifs({ ...notifs, reviewEmail: v })
                  }
                />
                <Separator />
                <ToggleRow
                  label="Нөөц дутах мэдэгдэл"
                  description="Бараа 5-аас бага болоход"
                  checked={notifs.lowStockEmail}
                  onCheckedChange={(v) =>
                    setNotifs({ ...notifs, lowStockEmail: v })
                  }
                />
                <Separator />
                <ToggleRow
                  label="Маркетингийн имэйл"
                  description="Урамшуулал, мэдээ мэдээлэл"
                  checked={notifs.marketingEmail}
                  onCheckedChange={(v) =>
                    setNotifs({ ...notifs, marketingEmail: v })
                  }
                />
              </div>
            </Section>
          )}

          {activeSection === "payment" && (
            <Section
              title="Төлбөрийн тохиргоо"
              description="Хүлээн авах банк болон данс"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Банк</Label>
                  <select className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm h-9 focus:outline-none focus:ring-2 focus:ring-ring">
                    <option>Хаан банк</option>
                    <option>Голомт банк</option>
                    <option>ТДБ</option>
                    <option>Төрийн банк</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bank-acc">Дансны дугаар</Label>
                  <Input
                    id="bank-acc"
                    placeholder="0000000000"
                    className="rounded-xl h-9 text-sm"
                  />
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <Label htmlFor="bank-holder">Данс эзэмшигч</Label>
                  <Input
                    id="bank-holder"
                    placeholder="AURA SKIN LLC"
                    className="rounded-xl h-9 text-sm"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-muted/40 rounded-xl text-xs text-muted-foreground">
                <Shield size={13} className="shrink-0" />
                Төлбөрийн мэдээлэл нь шифрлэгдэж хадгалагдана
              </div>
            </Section>
          )}

          {activeSection === "security" && (
            <Section title="Аюулгүй байдал" description="Бүртгэлийн хамгаалалт">
              <div className="space-y-5">
                <ToggleRow
                  label="Хоёр шатлалт баталгаажуулалт"
                  description="Нэвтрэх бүрд OTP код шаардах"
                  checked={security.twoFactor}
                  onCheckedChange={(v) =>
                    setSecurity({ ...security, twoFactor: v })
                  }
                />
                <Separator />
                <ToggleRow
                  label="Нэвтрэлтийн мэдэгдэл"
                  description="Шинэ төхөөрөмжөөс нэвтэрвэл имэйл авах"
                  checked={security.loginAlerts}
                  onCheckedChange={(v) =>
                    setSecurity({ ...security, loginAlerts: v })
                  }
                />
                <Separator />
                <ToggleRow
                  label="Идэвхгүй болоход гарах"
                  description="30 минут идэвхгүй бол автоматаар гарна"
                  checked={security.sessionTimeout}
                  onCheckedChange={(v) =>
                    setSecurity({ ...security, sessionTimeout: v })
                  }
                />
                <Separator />
                <div className="space-y-2">
                  <Label>Нууц үг солих</Label>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Input
                      type="password"
                      placeholder="Одоогийн нууц үг"
                      className="rounded-xl h-9 text-sm"
                    />
                    <Input
                      type="password"
                      placeholder="Шинэ нууц үг"
                      className="rounded-xl h-9 text-sm"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full mt-1"
                  >
                    Солих
                  </Button>
                </div>
              </div>
            </Section>
          )}

          {activeSection === "display" && (
            <Section
              title="Харагдацын тохиргоо"
              description="Самбарын харагдах байдал"
            >
              <div className="space-y-5">
                <ToggleRow
                  label="Харанхуй горим"
                  description="Нүдний ядрал бууруулах"
                  checked={display.darkMode}
                  onCheckedChange={(v) =>
                    setDisplay({ ...display, darkMode: v })
                  }
                />
                <Separator />
                <ToggleRow
                  label="Нягт хүснэгт"
                  description="Мөр хооронд зай багасгах"
                  checked={display.compactTable}
                  onCheckedChange={(v) =>
                    setDisplay({ ...display, compactTable: v })
                  }
                />
                <Separator />
                <ToggleRow
                  label="Орлого харуулах"
                  description="Самбар дээр орлогын тоог нууцлах"
                  checked={display.showRevenue}
                  onCheckedChange={(v) =>
                    setDisplay({ ...display, showRevenue: v })
                  }
                />
              </div>
            </Section>
          )}

          {activeSection === "locale" && (
            <Section title="Хэл & Бүсийн тохиргоо">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Хэл</Label>
                  <select className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm h-9 focus:outline-none focus:ring-2 focus:ring-ring">
                    <option>Монгол</option>
                    <option>English</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Валют</Label>
                  <select className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm h-9 focus:outline-none focus:ring-2 focus:ring-ring">
                    <option>MNT — Монгол төгрөг (₮)</option>
                    <option>USD — Ам.доллар ($)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Цагийн бүс</Label>
                  <select className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm h-9 focus:outline-none focus:ring-2 focus:ring-ring">
                    <option>Asia/Ulaanbaatar (UTC+8)</option>
                    <option>UTC</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Огнооны формат</Label>
                  <select className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm h-9 focus:outline-none focus:ring-2 focus:ring-ring">
                    <option>YYYY-MM-DD</option>
                    <option>DD/MM/YYYY</option>
                    <option>MM/DD/YYYY</option>
                  </select>
                </div>
              </div>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}
