"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Archive, ArrowUpRight, Check, Cloud, CloudOff, CopyPlus, Eye, EyeOff,
  FolderKanban, Globe2, LayoutGrid, Layers3, MoreHorizontal, Pencil,
  Plus, Search, ShieldCheck, Sparkles, Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Toaster } from "@/components/ui/sonner";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Accent = "coral" | "blue" | "green" | "violet" | "amber" | "slate";
type PortalSite = {
  id: string;
  name: string;
  description: string;
  url: string | null;
  category: string;
  accent: Accent;
  hidden: boolean;
  published: boolean;
  versionCount: number;
  source: "chatgpt" | "manual";
  createdAt: string;
  updatedAt: string;
};
type SiteForm = {
  name: string;
  description: string;
  url: string;
  category: string;
  accent: Accent;
  hidden: boolean;
  published: boolean;
  versionCount: number;
};
type ViewFilter = "all" | "published" | "draft" | "hidden";

const accentOptions: { value: Accent; label: string; swatch: string }[] = [
  { value: "coral", label: "珊瑚红", swatch: "#e07563" },
  { value: "blue", label: "空间蓝", swatch: "#4f75a8" },
  { value: "green", label: "生态绿", swatch: "#5b8874" },
  { value: "violet", label: "智能紫", swatch: "#7b6d9d" },
  { value: "amber", label: "工程黄", swatch: "#c4934e" },
  { value: "slate", label: "专业灰", swatch: "#64707c" },
];
const accentClasses: Record<Accent, { bar: string; soft: string; text: string }> = {
  coral: { bar: "bg-[#e07563]", soft: "bg-[#e07563]/10", text: "text-[#bd5848]" },
  blue: { bar: "bg-[#4f75a8]", soft: "bg-[#4f75a8]/10", text: "text-[#3f6495]" },
  green: { bar: "bg-[#5b8874]", soft: "bg-[#5b8874]/10", text: "text-[#477563]" },
  violet: { bar: "bg-[#7b6d9d]", soft: "bg-[#7b6d9d]/10", text: "text-[#665987]" },
  amber: { bar: "bg-[#c4934e]", soft: "bg-[#c4934e]/12", text: "text-[#9e7339]" },
  slate: { bar: "bg-[#64707c]", soft: "bg-[#64707c]/10", text: "text-[#4e5a66]" },
};
const emptyForm: SiteForm = {
  name: "", description: "", url: "", category: "其他", accent: "coral",
  hidden: false, published: true, versionCount: 1,
};

async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  const payload = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) throw new Error(payload.error || "请求失败，请稍后重试。");
  return payload;
}

function formFromSite(site: PortalSite): SiteForm {
  return {
    name: site.name,
    description: site.description,
    url: site.url ?? "",
    category: site.category,
    accent: site.accent,
    hidden: site.hidden,
    published: site.published,
    versionCount: site.versionCount,
  };
}

function hostLabel(value: string | null) {
  if (!value) return "尚未发布";
  try { return new URL(value).host; } catch { return value; }
}

export default function PortalClient({
  initialUser,
}: {
  initialUser: { displayName: string; email: string };
}) {
  const [sites, setSites] = useState<PortalSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ViewFilter>("all");
  const [category, setCategory] = useState("全部分类");
  const [search, setSearch] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<PortalSite | null>(null);
  const [form, setForm] = useState<SiteForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingSite, setDeletingSite] = useState<PortalSite | null>(null);

  useEffect(() => {
    let active = true;
    api<{ sites: PortalSite[] }>("/api/sites")
      .then((result) => { if (active) setSites(result.sites); })
      .catch((error) => { if (active) toast.error(error instanceof Error ? error.message : "站点加载失败。"); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const counts = useMemo(() => ({
    total: sites.length,
    published: sites.filter((site) => site.published).length,
    draft: sites.filter((site) => !site.published).length,
    hidden: sites.filter((site) => site.hidden).length,
  }), [sites]);
  const categories = useMemo(() => [
    "全部分类",
    ...Array.from(new Set(sites.map((site) => site.category))).sort((left, right) => left.localeCompare(right, "zh-CN")),
  ], [sites]);

  const filteredSites = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return sites.filter((site) => {
      const statusMatches = filter === "hidden"
        ? site.hidden
        : !site.hidden && (filter === "all" || (filter === "published" ? site.published : !site.published));
      const categoryMatches = category === "全部分类" || site.category === category;
      const searchMatches = !keyword || [site.name, site.description, site.category, site.url ?? ""]
        .join(" ").toLowerCase().includes(keyword);
      return statusMatches && categoryMatches && searchMatches;
    });
  }, [category, filter, search, sites]);

  function openCreate() {
    setEditingSite(null);
    setForm(emptyForm);
    setEditorOpen(true);
  }

  function openEdit(site: PortalSite) {
    setEditingSite(site);
    setForm(formFromSite(site));
    setEditorOpen(true);
  }

  async function saveSite(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const result = await api<{ site: PortalSite }>(
        editingSite ? `/api/sites/${editingSite.id}` : "/api/sites",
        {
          method: editingSite ? "PATCH" : "POST",
          body: JSON.stringify(form),
        },
      );
      setSites((current) => editingSite
        ? current.map((site) => site.id === result.site.id ? result.site : site)
        : [result.site, ...current]);
      setEditorOpen(false);
      toast.success(editingSite ? "卡片信息已更新。" : "新站点已收录。" );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "保存失败。");
    } finally {
      setSaving(false);
    }
  }

  async function toggleHidden(site: PortalSite) {
    try {
      const result = await api<{ site: PortalSite }>(`/api/sites/${site.id}`, {
        method: "PATCH",
        body: JSON.stringify({ ...formFromSite(site), hidden: !site.hidden }),
      });
      setSites((current) => current.map((item) => item.id === site.id ? result.site : item));
      toast.success(site.hidden ? "卡片已恢复显示。" : "卡片已隐藏。" );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "操作失败。");
    }
  }

  async function deleteCard() {
    if (!deletingSite) return;
    try {
      await api(`/api/sites/${deletingSite.id}`, { method: "DELETE" });
      setSites((current) => current.filter((site) => site.id !== deletingSite.id));
      toast.success("卡片已从门户移除，原始 ChatGPT Site 未删除。" );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "删除失败。");
    } finally {
      setDeletingSite(null);
    }
  }

  return (
    <div className="portal-shell min-h-screen bg-[#eeece6] text-[#17212b]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[270px] flex-col bg-[#16222c] px-5 py-6 text-white lg:flex">
        <div className="flex items-center gap-3 px-2">
          <div className="grid size-11 place-items-center rounded-[15px] bg-[#e07563] text-sm font-black">YS</div>
          <div><div className="font-serif text-lg font-semibold tracking-wide">MY SITES</div><div className="text-[11px] tracking-[0.18em] text-white/45">CHATGPT 站点总门户</div></div>
        </div>
        <nav className="mt-12 space-y-2" aria-label="站点状态筛选">
          <SidebarButton active={filter === "all"} icon={<LayoutGrid />} label="全部站点" count={counts.total - counts.hidden} onClick={() => setFilter("all")} />
          <SidebarButton active={filter === "published"} icon={<Cloud />} label="已发布" count={counts.published - sites.filter((site) => site.published && site.hidden).length} onClick={() => setFilter("published")} />
          <SidebarButton active={filter === "draft"} icon={<CloudOff />} label="待发布" count={counts.draft - sites.filter((site) => !site.published && site.hidden).length} onClick={() => setFilter("draft")} />
          <SidebarButton active={filter === "hidden"} icon={<EyeOff />} label="已隐藏" count={counts.hidden} onClick={() => setFilter("hidden")} />
        </nav>
        <div className="mt-auto rounded-[22px] border border-white/10 bg-white/[0.045] p-4">
          <div className="flex items-center gap-2 text-sm font-medium"><ShieldCheck className="size-4 text-[#e98d7e]" />门户仅你可见</div>
          <p className="mt-2 text-xs leading-5 text-white/45">已发布站点采用公开链接，点击卡片即可直接查看，无需逐站授权。</p>
          <div className="mt-4 flex items-end justify-between"><strong className="font-serif text-3xl font-semibold">{counts.published}</strong><span className="pb-1 text-[11px] text-white/38">个站点可直接打开</span></div>
        </div>
      </aside>

      <main className="min-h-screen lg:pl-[270px]">
        <header className="sticky top-0 z-20 border-b border-[#17212b]/8 bg-[#eeece6]/92 px-5 py-4 backdrop-blur-xl md:px-8 lg:px-10">
          <div className="mx-auto flex max-w-[1500px] items-center gap-4">
            <div className="flex items-center gap-3 lg:hidden"><div className="grid size-9 place-items-center rounded-xl bg-[#16222c] text-xs font-black text-white">YS</div><span className="font-serif font-semibold">我的 Sites</span></div>
            <div className="relative hidden w-full max-w-[430px] md:block">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#17212b]/36" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜索站点、分类或地址" className="h-11 rounded-full border-[#17212b]/10 bg-white/65 pl-11 shadow-none" />
            </div>
            <Button onClick={openCreate} className="ml-auto h-11 rounded-full bg-[#e07563] px-5 text-white shadow-[0_8px_24px_rgba(224,117,99,.24)] hover:bg-[#cf6655]"><Plus className="size-4" />收录新站点</Button>
            <div className="hidden items-center gap-3 rounded-full bg-white/55 py-1 pl-1 pr-4 sm:flex"><span className="grid size-9 place-items-center rounded-full bg-[#16222c] text-xs font-bold text-white">云</span><span className="text-sm"><strong className="block max-w-[120px] truncate font-semibold">{initialUser.displayName}</strong><small className="text-[#17212b]/42">门户所有者</small></span></div>
          </div>
        </header>

        <div className="mx-auto max-w-[1500px] px-5 pb-14 pt-8 md:px-8 lg:px-10 lg:pt-10">
          <section className="mb-8 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div><div className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-[#e07563]"><span className="h-px w-7 bg-[#e07563]" />CHATGPT SITES COLLECTION</div><h1 className="font-serif text-4xl font-semibold tracking-tight md:text-5xl">我的站点总门户</h1><p className="mt-3 text-sm leading-6 text-[#17212b]/52">集中管理过去与未来创建的 ChatGPT Sites，按卡片快速进入当前线上版本。</p></div>
            <div className="grid grid-cols-4 divide-x divide-[#17212b]/10 overflow-hidden rounded-[20px] border border-[#17212b]/8 bg-white/50 px-2 py-3 sm:min-w-[470px]"><Stat value={counts.total} label="已收录" /><Stat value={counts.published} label="已发布" /><Stat value={counts.draft} label="待发布" /><Stat value={counts.hidden} label="已隐藏" /></div>
          </section>

          <section className="mb-6 flex flex-col gap-3 rounded-[20px] border border-[#17212b]/8 bg-white/40 p-3 md:flex-row md:items-center">
            <div className="relative md:hidden"><Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#17212b]/36" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜索站点" className="h-11 rounded-full bg-white pl-11" /></div>
            <div className="flex gap-2 overflow-x-auto scrollbar-none">
              {categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-medium transition ${category === item ? "bg-[#16222c] text-white" : "bg-white/65 text-[#17212b]/55 hover:bg-white"}`}>{item}</button>)}
            </div>
            {(category !== "全部分类" || search) && <button onClick={() => { setCategory("全部分类"); setSearch(""); }} className="ml-auto whitespace-nowrap px-2 text-xs text-[#e07563]">清除筛选</button>}
          </section>

          {loading ? <CardSkeletons /> : filteredSites.length ? (
            <section className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3" aria-label="ChatGPT Sites 卡片">
              {filteredSites.map((site, index) => <SiteCard key={site.id} site={site} index={index} onEdit={openEdit} onToggleHidden={toggleHidden} onDelete={setDeletingSite} />)}
            </section>
          ) : <EmptyState filter={filter} onCreate={openCreate} onClear={() => { setFilter("all"); setCategory("全部分类"); setSearch(""); }} />}
        </div>
      </main>

      <SiteEditor open={editorOpen} onOpenChange={setEditorOpen} editingSite={editingSite} form={form} setForm={setForm} onSubmit={saveSite} saving={saving} />
      <DeleteCardDialog site={deletingSite} onOpenChange={(open) => !open && setDeletingSite(null)} onConfirm={deleteCard} />
      <Toaster richColors position="top-center" />
    </div>
  );
}

function SidebarButton({ active, icon, label, count, onClick }: { active: boolean; icon: React.ReactNode; label: string; count: number; onClick: () => void }) {
  return <button onClick={onClick} className={`flex w-full items-center gap-3 rounded-[14px] px-3 py-3 text-sm transition ${active ? "bg-white text-[#17212b]" : "text-white/58 hover:bg-white/6 hover:text-white"}`}><span className={`[&_svg]:size-4 ${active ? "text-[#e07563]" : "text-white/40"}`}>{icon}</span><span className="font-medium">{label}</span><span className={`ml-auto min-w-6 rounded-full px-1.5 py-0.5 text-center text-[10px] ${active ? "bg-[#e07563]/12 text-[#c65d4d]" : "bg-white/7 text-white/35"}`}>{count}</span></button>;
}
function Stat({ value, label }: { value: number; label: string }) { return <div className="px-3 text-center"><strong className="block font-serif text-2xl font-semibold">{String(value).padStart(2, "0")}</strong><span className="mt-0.5 block text-[11px] text-[#17212b]/42">{label}</span></div>; }

function SiteCard({ site, index, onEdit, onToggleHidden, onDelete }: { site: PortalSite; index: number; onEdit: (site: PortalSite) => void; onToggleHidden: (site: PortalSite) => void; onDelete: (site: PortalSite) => void }) {
  const accent = accentClasses[site.accent] ?? accentClasses.coral;
  return (
    <article className={`group relative overflow-hidden rounded-[24px] border border-[#17212b]/8 bg-[#faf9f6] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(31,40,48,.10)] ${site.hidden ? "opacity-65" : ""}`}>
      <div className={`h-1.5 ${accent.bar}`} />
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3"><span className={`grid size-12 place-items-center rounded-[16px] ${accent.soft} ${accent.text}`}>{site.source === "chatgpt" ? <Sparkles className="size-5" /> : <Globe2 className="size-5" />}</span><div><span className="text-[10px] font-semibold tracking-[0.16em] text-[#17212b]/35">SITE {String(index + 1).padStart(2, "0")}</span><div className="mt-1 flex flex-wrap items-center gap-2"><span className="text-xs font-medium text-[#17212b]/50">{site.category}</span>{site.hidden && <span className="rounded-full bg-[#17212b]/7 px-2 py-0.5 text-[10px] text-[#17212b]/45">已隐藏</span>}</div></div></div>
          <DropdownMenu><DropdownMenuTrigger asChild><button className="grid size-9 place-items-center rounded-full text-[#17212b]/45 transition hover:bg-[#17212b]/6 hover:text-[#17212b]" aria-label={`${site.name}更多操作`}><MoreHorizontal className="size-5" /></button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-44 rounded-xl p-1.5"><DropdownMenuItem onSelect={() => onEdit(site)} className="rounded-lg py-2"><Pencil />编辑卡片</DropdownMenuItem><DropdownMenuItem onSelect={() => void onToggleHidden(site)} className="rounded-lg py-2">{site.hidden ? <Eye /> : <EyeOff />}{site.hidden ? "恢复显示" : "隐藏卡片"}</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem variant="destructive" onSelect={() => onDelete(site)} className="rounded-lg py-2"><Trash2 />从门户删除</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
        </div>
        <h2 className="mt-7 min-h-[62px] font-serif text-[25px] font-semibold leading-[1.25] tracking-tight">{site.name}</h2>
        <p className="mt-3 line-clamp-2 min-h-[48px] text-sm leading-6 text-[#17212b]/52">{site.description || "暂无站点说明。"}</p>
        <div className="mt-6 flex items-center gap-2 border-t border-[#17212b]/7 pt-4 text-xs text-[#17212b]/42"><span className={`size-1.5 rounded-full ${site.published ? "bg-emerald-500" : "bg-amber-500"}`} /><span>{site.published ? "已发布 · 直接访问" : "尚未发布"}</span><span className="ml-auto flex items-center gap-1"><Layers3 className="size-3" />{site.versionCount ? `${site.versionCount} 个版本` : "暂无版本"}</span></div>
        {site.published && site.url ? <a href={site.url} target="_blank" rel="noreferrer" className="mt-5 flex h-11 w-full items-center justify-between rounded-xl border border-[#17212b]/10 bg-white/70 px-4 text-sm font-medium transition hover:bg-[#16222c] hover:text-white"><span className="min-w-0 truncate">{hostLabel(site.url)}</span><ArrowUpRight className="ml-3 size-4 shrink-0" /></a> : <div className="mt-5 flex h-11 w-full items-center justify-between rounded-xl border border-dashed border-[#17212b]/12 bg-[#17212b]/[0.025] px-4 text-sm text-[#17212b]/38"><span>等待在 ChatGPT Sites 中发布</span><Archive className="size-4" /></div>}
      </div>
    </article>
  );
}

function CardSkeletons() { return <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">{Array.from({ length: 9 }, (_, index) => <div key={index} className="h-[354px] animate-pulse rounded-[24px] border border-[#17212b]/7 bg-white/55" />)}</div>; }
function EmptyState({ filter, onCreate, onClear }: { filter: ViewFilter; onCreate: () => void; onClear: () => void }) { return <section className="grid min-h-[390px] place-items-center rounded-[28px] border border-dashed border-[#17212b]/16 bg-white/35 p-8 text-center"><div><span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#e07563]/10 text-[#e07563]">{filter === "hidden" ? <EyeOff className="size-6" /> : <FolderKanban className="size-6" />}</span><h2 className="mt-5 font-serif text-2xl font-semibold">这里暂时没有卡片</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#17212b]/48">新建 ChatGPT Site 后，可以把站点链接收录到这里；隐藏的卡片可随时恢复。</p><div className="mt-6 flex justify-center gap-2"><Button variant="outline" onClick={onClear} className="rounded-full">清除筛选</Button><Button onClick={onCreate} className="rounded-full bg-[#16222c] px-6 text-white"><Plus />收录站点</Button></div></div></section>; }

function SiteEditor({ open, onOpenChange, editingSite, form, setForm, onSubmit, saving }: { open: boolean; onOpenChange: (open: boolean) => void; editingSite: PortalSite | null; form: SiteForm; setForm: (form: SiteForm) => void; onSubmit: (event: FormEvent) => void; saving: boolean }) {
  const set = <K extends keyof SiteForm>(key: K, value: SiteForm[K]) => setForm({ ...form, [key]: value });
  const builtIn = editingSite?.source === "chatgpt";
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-h-[92vh] overflow-y-auto rounded-[24px] border-0 p-0 sm:max-w-[640px]"><form onSubmit={onSubmit}><DialogHeader className="border-b border-[#17212b]/8 px-7 py-6"><DialogTitle className="font-serif text-2xl">{editingSite ? "编辑站点卡片" : "收录新的 ChatGPT Site"}</DialogTitle><DialogDescription>{builtIn ? "可修改门户中的显示名称、说明、分类与颜色，不影响原始 Site。" : "粘贴新 Site 的地址，未来创建的站点也可以继续加入门户。"}</DialogDescription></DialogHeader><div className="space-y-6 px-7 py-6">
    <div className="grid gap-5 sm:grid-cols-2"><Field label="站点名称" required><Input value={form.name} onChange={(event) => set("name", event.target.value)} placeholder="例如：数字孪生校园" className="h-11 rounded-xl" /></Field><Field label="分类" required><Input value={form.category} onChange={(event) => set("category", event.target.value)} placeholder="例如：数字孪生" className="h-11 rounded-xl" /></Field></div>
    <Field label="站点说明"><textarea value={form.description} onChange={(event) => set("description", event.target.value)} maxLength={260} rows={3} placeholder="简要说明站点用途" className="w-full resize-none rounded-xl border border-input bg-transparent px-3 py-2.5 text-sm outline-none transition focus:border-ring focus:ring-[3px] focus:ring-ring/30" /></Field>
    {!builtIn && <><Field label="ChatGPT Site 地址"><Input type="url" value={form.url} onChange={(event) => set("url", event.target.value)} placeholder="https://example.yourname.chatgpt.site" className="h-11 rounded-xl" /></Field><div className="grid gap-5 sm:grid-cols-2"><Field label="版本数量"><Input type="number" min={0} max={999} value={form.versionCount} onChange={(event) => set("versionCount", Number(event.target.value))} className="h-11 rounded-xl" /></Field><div className="flex items-center justify-between rounded-[16px] border border-[#17212b]/9 px-4"><div><div className="text-sm font-semibold">已经发布</div><p className="mt-1 text-[11px] text-[#17212b]/42">有访问地址时开启</p></div><Switch checked={form.published} onCheckedChange={(checked) => set("published", checked)} /></div></div></>}
    <Field label="卡片标识色"><div className="flex flex-wrap gap-2">{accentOptions.map((option) => <button key={option.value} type="button" onClick={() => set("accent", option.value)} className={`flex items-center gap-2 rounded-full border px-3 py-2 text-xs transition ${form.accent === option.value ? "border-[#17212b]/30 bg-[#17212b]/5" : "border-[#17212b]/8"}`}><span className="size-3 rounded-full" style={{ backgroundColor: option.swatch }} />{option.label}{form.accent === option.value && <Check className="size-3" />}</button>)}</div></Field>
    <div className="flex items-center justify-between rounded-[18px] border border-[#17212b]/9 bg-[#f7f5f0] p-4"><div><div className="text-sm font-semibold">隐藏此卡片</div><p className="mt-1 text-xs text-[#17212b]/43">隐藏后可以在“已隐藏”中恢复。</p></div><Switch checked={form.hidden} onCheckedChange={(checked) => set("hidden", checked)} /></div>
    {!editingSite && <div className="flex gap-3 rounded-[16px] bg-[#e07563]/8 p-4 text-xs leading-5 text-[#8f4b40]"><CopyPlus className="mt-0.5 size-4 shrink-0" /><span>门户无法在运行时自动读取你的 Sites 列表。以后创建新 Site 后，只需在这里粘贴链接即可继续收录。</span></div>}
  </div><DialogFooter className="border-t border-[#17212b]/8 px-7 py-5"><Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">取消</Button><Button type="submit" disabled={saving} className="rounded-xl bg-[#e07563] px-6 text-white hover:bg-[#cf6655]">{saving ? "正在保存…" : editingSite ? "保存修改" : "加入门户"}</Button></DialogFooter></form></DialogContent></Dialog>;
}
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) { return <div className="space-y-2"><Label>{label}{required && <span className="ml-1 text-[#e07563]">*</span>}</Label>{children}</div>; }

function DeleteCardDialog({ site, onOpenChange, onConfirm }: { site: PortalSite | null; onOpenChange: (open: boolean) => void; onConfirm: () => void }) {
  return <AlertDialog open={Boolean(site)} onOpenChange={onOpenChange}><AlertDialogContent className="rounded-[22px]"><AlertDialogHeader><AlertDialogTitle className="font-serif text-xl">从门户删除“{site?.name}”？</AlertDialogTitle><AlertDialogDescription className="leading-6">这里只会删除门户中的卡片，不会删除原始 ChatGPT Site、站点版本或线上页面。删除后需要重新收录才能恢复。</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel className="rounded-xl">取消</AlertDialogCancel><AlertDialogAction onClick={onConfirm} variant="destructive" className="rounded-xl"><Trash2 />删除卡片</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>;
}
