"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "../../../services/api";
import { Icon } from "@iconify/react";

interface SettingsData {
  id?: number;
  tournamentName: string;
  tournamentLogo: string;
  season: string;
  slug: string;
  registrationOpen: boolean;
  whatsappTemplate: string;
}

const SUPPORTED_VARIABLES = [
  { name: "{{playerName}}", label: "Player Name", example: "Virat Kohli" },
  { name: "{{teamName}}", label: "Team Name", example: "Royal Strikers" },
  { name: "{{soldAmount}}", label: "Final Bid Amount", example: "50,000" },
  { name: "{{category}}", label: "Player Category", example: "All Rounder" },
  { name: "{{tournamentName}}", label: "Tournament Name", example: "Kudal Premier League" },
];

export default function TournamentSettingsPage() {
  const [settings, setSettings] = useState<SettingsData>({
    tournamentName: "Kudal Premier League",
    tournamentLogo: "",
    season: "Season 1",
    slug: "kudal-premier-league",
    registrationOpen: true,
    whatsappTemplate: `🏏 Congratulations {{playerName}}!\n\nYou have been selected in {{tournamentName}}.\n\n🏆 Team\n{{teamName}}\n\n💰 Sold Amount\n₹{{soldAmount}}\n\n📂 Category\n{{category}}\n\nWe wish you all the best for the tournament!\n\nThank you.`,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ type: "", text: "", visible: false });
  const [templateCursorPos, setTemplateCursorPos] = useState<number | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get("/settings");
      if (res.data) {
        setSettings({
          id: res.data.id,
          tournamentName: res.data.tournamentName || "Kudal Premier League",
          tournamentLogo: res.data.tournamentLogo || "",
          season: res.data.season || "Season 1",
          slug: res.data.slug || "kudal-premier-league",
          registrationOpen: res.data.registrationOpen !== undefined ? res.data.registrationOpen : true,
          whatsappTemplate: res.data.whatsappTemplate || "",
        });
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
      showToast("error", "Failed to load tournament settings.");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type: "error" | "success", text: string) => {
    setToast({ type, text, visible: true });
    setTimeout(() => setToast({ type: "", text: "", visible: false }), 4000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings((prev) => ({ ...prev, tournamentLogo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInsertVariable = (varName: string) => {
    const textarea = document.getElementById("whatsappTemplateArea") as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart || settings.whatsappTemplate.length;
      const end = textarea.selectionEnd || settings.whatsappTemplate.length;
      const text = settings.whatsappTemplate;
      const updatedText = text.substring(0, start) + varName + text.substring(end);
      setSettings((prev) => ({ ...prev, whatsappTemplate: updatedText }));
      
      // Set cursor position after the inserted tag
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + varName.length, start + varName.length);
      }, 0);
    } else {
      setSettings((prev) => ({ ...prev, whatsappTemplate: prev.whatsappTemplate + " " + varName }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings.tournamentName.trim()) {
      showToast("error", "Tournament Name is required.");
      return;
    }

    setSaving(true);
    try {
      const res = await api.put("/settings", settings);
      if (res.data && res.data.settings) {
        setSettings(res.data.settings);
      }
      showToast("success", "Tournament Settings saved successfully!");
    } catch (error: any) {
      console.error("Save error:", error);
      showToast("error", error?.response?.data?.error || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  // Generate live preview string
  const renderPreview = () => {
    let preview = settings.whatsappTemplate;
    preview = preview.replace(/\{\{\s*playerName\s*\}\}/gi, "Sahil Patel");
    preview = preview.replace(/\{\{\s*teamName\s*\}\}/gi, "Kudal Warriors");
    preview = preview.replace(/\{\{\s*soldAmount\s*\}\}/gi, "6,000");
    preview = preview.replace(/\{\{\s*category\s*\}\}/gi, "All Rounder");
    preview = preview.replace(/\{\{\s*tournamentName\s*\}\}/gi, settings.tournamentName || "Jawali Premier League");
    return preview;
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-white p-6 md:p-12 font-sans selection:bg-purple-500/30">
      {/* Toast Notification */}
      <div
        className={`fixed top-6 right-6 z-50 transition-all duration-300 transform ${
          toast.visible ? "translate-x-0 opacity-100" : "translate-x-[200%] opacity-0"
        }`}
      >
        <div
          className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-md border ${
            toast.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}
        >
          <Icon icon={toast.type === "success" ? "lucide:check-circle" : "lucide:alert-circle"} className="text-xl" />
          <p className="font-medium tracking-wide">{toast.text}</p>
        </div>
      </div>

      {/* Header & Navigation */}
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-1">
              <Link href="/admin" className="hover:underline flex items-center gap-1 text-slate-400 hover:text-cyan-400 transition-colors">
                <Icon icon="solar:arrow-left-bold" /> Admin Dashboard
              </Link>
              <span>/</span>
              <span>Settings</span>
            </div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Tournament Settings
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Configure global tournament information and customize automated WhatsApp notification templates.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/tournaments"
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white border border-amber-400/30 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg"
            >
              <Icon icon="solar:cup-star-bold" className="text-base" />
              Tournaments Hub
            </Link>
            <Link
              href="/admin"
              className="bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg"
            >
              <Icon icon="solar:alt-arrow-left-bold" className="text-base" />
              Back to Dashboard
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <Icon icon="solar:spinner-bold" className="text-4xl text-cyan-400 animate-spin" />
            <p className="text-slate-400 text-sm font-medium">Loading settings...</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-8">
            {/* Section 1: Tournament Information */}
            <section className="bg-slate-950/80 border border-slate-800/80 p-6 md:p-8 rounded-3xl backdrop-blur-xl shadow-2xl space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-800/60 pb-4">
                <div className="p-3 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-xl">
                  <Icon icon="solar:settings-bold" className="text-2xl" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Tournament Information</h2>
                  <p className="text-xs text-slate-400">Basic details displayed across the auction application</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tournament Name */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    Tournament Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={settings.tournamentName}
                    onChange={(e) => setSettings({ ...settings, tournamentName: e.target.value })}
                    placeholder="e.g. Kudal Premier League"
                    className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>

                {/* Season */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    Tournament Season <span className="text-slate-500">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={settings.season}
                    onChange={(e) => setSettings({ ...settings, season: e.target.value })}
                    placeholder="e.g. Season 1 or 2026"
                    className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>

                {/* Tournament Slug */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    Registration URL Slug
                  </label>
                  <input
                    type="text"
                    value={settings.slug}
                    onChange={(e) => setSettings({ ...settings, slug: e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") })}
                    placeholder="e.g. kudal-premier-league"
                    className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono transition-colors"
                  />
                  {settings.slug && (
                    <p className="text-[11px] text-slate-500">
                      Registration link: <span className="text-cyan-400 font-mono">/register/{settings.slug}</span>
                    </p>
                  )}
                </div>

                {/* Registration Status */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    Registration Status
                  </label>
                  <div className="flex items-center gap-3 p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, registrationOpen: true })}
                      className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                        settings.registrationOpen
                          ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                          : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600"
                      }`}
                    >
                      ✅ Open
                    </button>
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, registrationOpen: false })}
                      className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                        !settings.registrationOpen
                          ? "bg-red-500/20 border-red-500/50 text-red-300"
                          : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600"
                      }`}
                    >
                      🚫 Closed
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {settings.registrationOpen
                      ? "Players can currently register via the public link."
                      : "Registration is closed. The form will show a closed notice."}
                  </p>
                </div>

                {/* Tournament Logo Upload */}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    Tournament Logo <span className="text-slate-500">(Optional)</span>
                  </label>
                  <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-slate-900/40 border border-slate-800 rounded-2xl">
                    <div className="w-20 h-20 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                      {settings.tournamentLogo ? (
                        <img src={settings.tournamentLogo} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <Icon icon="solar:cup-star-bold" className="text-3xl text-slate-600" />
                      )}
                    </div>
                    <div className="space-y-2 flex-1 w-full">
                      <input
                        type="file"
                        accept="image/*"
                        id="tournament-logo-input"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                      <div className="flex items-center gap-3">
                        <label
                          htmlFor="tournament-logo-input"
                          className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer transition-colors flex items-center gap-2 border border-slate-700"
                        >
                          <Icon icon="solar:upload-minimalistic-bold" className="text-base text-cyan-400" />
                          Upload Logo
                        </label>
                        {settings.tournamentLogo && (
                          <button
                            type="button"
                            onClick={() => setSettings({ ...settings, tournamentLogo: "" })}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-xs px-3 py-2 rounded-xl transition-colors"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">Supported formats: PNG, JPG, WEBP or Base64 image string.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2: WhatsApp Message Template */}
            <section className="bg-slate-950/80 border border-slate-800/80 p-6 md:p-8 rounded-3xl backdrop-blur-xl shadow-2xl space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-800/60 pb-4">
                <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl">
                  <Icon icon="logos:whatsapp-icon" className="text-2xl" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">WhatsApp Message Template</h2>
                  <p className="text-xs text-slate-400">
                    Customize the message sent automatically to players when sold. Multiline & emojis allowed.
                  </p>
                </div>
              </div>

              {/* Supported Variables Pills */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Click to Insert Dynamic Placeholders:
                </label>
                <div className="flex flex-wrap gap-2">
                  {SUPPORTED_VARIABLES.map((v) => (
                    <button
                      key={v.name}
                      type="button"
                      onClick={() => handleInsertVariable(v.name)}
                      className="bg-slate-900 hover:bg-emerald-950/80 text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 hover:border-emerald-500/60 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all flex items-center gap-1.5 shadow-sm"
                      title={`Replaces with ${v.label} (e.g. ${v.example})`}
                    >
                      <Icon icon="solar:add-circle-bold" className="text-emerald-400" />
                      {v.name}
                      <span className="text-[10px] text-slate-500 font-sans font-normal ml-0.5">({v.label})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Textarea & Live Preview Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Editor Box */}
                <div className="lg:col-span-7 space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    Message Template Textarea
                  </label>
                  <textarea
                    id="whatsappTemplateArea"
                    rows={10}
                    value={settings.whatsappTemplate}
                    onChange={(e) => setSettings({ ...settings, whatsappTemplate: e.target.value })}
                    placeholder="Write your WhatsApp message template here..."
                    className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-sm text-white font-sans placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors leading-relaxed shadow-inner"
                  />
                  <p className="text-[11px] text-slate-500">
                    Note: Avoid modifying variable names inside double curly braces <code>&#123;&#123;...&#125;&#125;</code>.
                  </p>
                </div>

                {/* Live Preview Box */}
                <div className="lg:col-span-5 space-y-2 flex flex-col">
                  <label className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Icon icon="solar:eye-bold" className="text-base" /> Live Sample Preview
                  </label>
                  <div className="flex-1 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-4 flex flex-col justify-between backdrop-blur-sm">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 pb-2 border-b border-emerald-500/20">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          <Icon icon="logos:whatsapp-icon" className="text-xs" />
                        </div>
                        <span className="text-xs font-bold text-emerald-300">WhatsApp Chat Preview</span>
                      </div>
                      <div className="bg-[#0b141a] border border-emerald-900/50 rounded-xl p-3.5 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed font-sans font-medium shadow-md">
                        {renderPreview()}
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 italic mt-3 text-right">
                      * Uses sample player data for live preview.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Save Button Bar */}
            <div className="flex items-center justify-end gap-4 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 font-black px-8 py-4 rounded-2xl text-sm uppercase tracking-wider shadow-2xl shadow-indigo-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Icon icon="solar:spinner-bold" className="text-lg animate-spin" />
                    Saving Settings...
                  </>
                ) : (
                  <>
                    <Icon icon="solar:diskette-bold" className="text-lg" />
                    Save Tournament Settings
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
