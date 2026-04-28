import { MapPin, Phone, Clock } from "lucide-react";

// Салбар дэлгүүрүүдийн байршил, холбоо барих мэдээлэл.
const BRANCHES = [
  {
    id: 1,
    name: "Төв салбар — Сүхбаатар",
    address: "Сүхбаатар дүүрэг, Энхтайвны өргөн чөлөө 15, ЗМ Молл, 2 давхар",
    phone: "+976 7700-0001",
    hours: "Даваа–Баасан: 10:00–20:00 · Бямба–Ням: 11:00–19:00",
    tag: "Флагман",
  },
  {
    id: 2,
    name: "Салбар — Баянзүрх",
    address: "Баянзүрх дүүрэг, Сэлбэ гудамж 8, Ном Олимп дэргэдэх",
    phone: "+976 7700-0002",
    hours: "Даваа–Ням: 10:00–20:00",
    tag: "Шинэ",
  },
  {
    id: 3,
    name: "Салбар — Хан-Уул",
    address: "Хан-Уул дүүрэг, Энхтайвны гудамж 23, Nomin Market дэргэд",
    phone: "+976 7700-0003",
    hours: "Даваа–Баасан: 10:00–19:00 · Бямба: 10:00–18:00",
    tag: null,
  },
  {
    id: 4,
    name: "Салбар — Сонгинохайрхан",
    address:
      "Сонгинохайрхан дүүрэг, Замын-Үүд гудамж 5, Цэнгэлдэх худалдааны төв",
    phone: "+976 7700-0004",
    hours: "Даваа–Ням: 09:30–20:30",
    tag: null,
  },
  {
    id: 5,
    name: "Салбар — Чингэлтэй",
    address: "Чингэлтэй дүүрэг, Бага тойруу, Тэнгис кино театрын дэргэд",
    phone: "+976 7700-0005",
    hours: "Даваа–Ням: 10:00–20:00",
    tag: null,
  },
];

// Home болон About хуудсанд дахин ашиглах боломжтой салбарын жагсаалт.
export default function BranchesSection() {
  return (
    <section id="branches" className="py-20 px-4 bg-muted/20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs tracking-[0.4em] uppercase text-muted-foreground mb-3">
            Манай хаяг
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground">
            Салбар дэлгүүрүүд
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {BRANCHES.map((b) => (
            <div
              key={b.id}
              className="bg-card border border-border rounded-2xl p-6 hover:shadow-sm transition-shadow flex flex-col gap-4"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-foreground leading-tight">
                  {b.name}
                </h3>
                {b.tag && (
                  <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-foreground text-background">
                    {b.tag}
                  </span>
                )}
              </div>
              <div className="space-y-2.5 text-sm">
                <div className="flex gap-2.5 text-muted-foreground">
                  <MapPin size={14} className="shrink-0 mt-0.5" />
                  <span>{b.address}</span>
                </div>
                <div className="flex gap-2.5 text-muted-foreground">
                  <Phone size={14} className="shrink-0 mt-0.5" />
                  <a
                    href={`tel:${b.phone.replace(/[\s-]/g, "")}`}
                    className="hover:text-foreground transition-colors"
                  >
                    {b.phone}
                  </a>
                </div>
                <div className="flex gap-2.5 text-muted-foreground">
                  <Clock size={14} className="shrink-0 mt-0.5" />
                  <span>{b.hours}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
