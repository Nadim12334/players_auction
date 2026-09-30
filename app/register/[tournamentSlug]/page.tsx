"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getImageUrl } from "../../../services/image";
import { Icon } from "@iconify/react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const CATEGORIES = ["Batsman", "Bowler", "All Rounder", "Wicket Keeper"] as const;
const BATTING_STYLES = ["Right Handed", "Left Handed"] as const;
const BOWLING_STYLES = [
  "Right-arm Fast",
  "Right-arm Medium",
  "Right-arm Spin",
  "Left-arm Fast",
  "Left-arm Spin",
  "None",
] as const;

interface TournamentInfo {
  id: number;
  tournamentName: string;
  tournamentLogo: string | null;
  season: string | null;
  registrationOpen: boolean;
  slug: string;
  status?: string;
}

export default function RegisterPage() {
  const params = useParams();
  const identifier = (params?.tournamentSlug as string) || "";

  const [tournament, setTournament] = useState<TournamentInfo | null>(null);
  const [loadingTournament, setLoadingTournament] = useState(true);
  const [tournamentNotFound, setTournamentNotFound] = useState(false);

  const [submitted, setSubmitted] = useState(false);
  const [registeredPlayer, setRegisteredPlayer] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "",
    phoneNumber: "",
    category: "",
    fromWhere: "",
    battingStyle: "Right Handed",
    bowlingStyle: "Right-arm Medium",
    age: "",
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!identifier) {
      setTournamentNotFound(true);
      setLoadingTournament(false);
      return;
    }
    fetchTournament(identifier);
  }, [identifier]);

  const fetchTournament = async (targetIdOrSlug: string) => {
    setLoadingTournament(true);
    setTournamentNotFound(false);
    try {
      const res = await fetch(`${API_URL}/tournaments/public/${encodeURIComponent(targetIdOrSlug)}`);
      if (!res.ok) {
        if (res.status === 404) {
          setTournamentNotFound(true);
          setTournament(null);
          return;
        }
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Unable to fetch tournament details");
      }
      const data = await res.json();
      setTournament(data);
    } catch (e: any) {
      console.error("Failed to fetch tournament:", e);
      setTournamentNotFound(true);
      setTournament(null);
    } finally {
      setLoadingTournament(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      setFieldErrors((p) => ({ ...p, photo: "Only JPG, JPEG, PNG, or WEBP formats are supported." }));
      setPhotoFile(null);
      setPhotoPreview(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFieldErrors((p) => ({ ...p, photo: "Photo size must be under 5 MB." }));
      setPhotoFile(null);
      setPhotoPreview(null);
      return;
    }

    setFieldErrors((p) => ({ ...p, photo: "" }));
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = "Full Name is required.";
    const cleanPhone = form.phoneNumber.replace(/[^0-9]/g, "");
    if (!cleanPhone || cleanPhone.length !== 10) errors.phoneNumber = "Enter a valid 10-digit mobile number.";
    if (!form.category) errors.category = "Please select a category.";
    if (!form.fromWhere.trim()) errors.fromWhere = "Village / City is required.";
    if (!photoFile) errors.photo = "Player photo is required.";
    if (form.age && (isNaN(Number(form.age)) || Number(form.age) < 10 || Number(form.age) > 80)) {
      errors.age = "Please enter a realistic age (10-80).";
    }
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!tournament) return;

    const errors = validate();
    setFieldErrors(errors);
    if (Object.values(errors).some(Boolean)) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("phoneNumber", form.phoneNumber.replace(/[^0-9]/g, ""));
      formData.append("category", form.category);
      formData.append("fromWhere", form.fromWhere.trim());
      formData.append("battingStyle", form.battingStyle);
      formData.append("bowlingStyle", form.bowlingStyle);
      if (form.age) formData.append("age", form.age.toString());
      formData.append("tournamentId", String(tournament.id));
      formData.append("tournamentSlug", tournament.slug);
      if (photoFile) formData.append("photoFile", photoFile);

      const res = await fetch(`${API_URL}/register/${tournament.id}`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed.");

      setRegisteredPlayer(data.player || { ...form, photo: photoPreview });
      setSubmitted(true);
    } catch (e: any) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── 1. Loading State ────────────────────────────────────────────────────────
  if (loadingTournament) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0f1e] via-[#0d1428] to-[#0a0f1e] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative">
            <div className="w-14 h-14 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Icon icon="solar:cup-star-bold" className="text-cyan-400 text-lg animate-pulse" />
            </div>
          </div>
          <div>
            <p className="text-white font-bold text-base">Loading Registration Page</p>
            <p className="text-slate-400 text-xs mt-1">Connecting to tournament details...</p>
          </div>
        </div>
      </div>
    );
  }

  // ─── 2. Tournament Not Found ────────────────────────────────────────────────
  if (tournamentNotFound || !tournament) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0f1e] via-[#0d1428] to-[#0a0f1e] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900/80 border border-slate-800 rounded-3xl p-8 text-center backdrop-blur-xl shadow-2xl space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400 text-4xl">
            <Icon icon="solar:shield-warning-bold" />
          </div>
          <div className="space-y-2">
            <span className="text-[11px] font-bold tracking-widest text-amber-400 uppercase bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 inline-block">
              404 • Not Found
            </span>
            <h1 className="text-2xl font-black text-white">Tournament Not Found</h1>
            <p className="text-slate-400 text-sm">
              We couldn’t find any tournament matching ID or slug{" "}
              <code className="bg-slate-800 text-cyan-300 px-2 py-0.5 rounded text-xs font-mono">
                {identifier || "empty"}
              </code>
              . The registration link may be incorrect, archived, or removed.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-3">
            <Link
              href="/"
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
            >
              <Icon icon="solar:home-smile-bold" className="text-base" />
              Go to Home Page
            </Link>
            <Link
              href="/admin/tournaments"
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              Are you an admin? View all tournaments
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── 3. Registration Closed ────────────────────────────────────────────────
  if (!tournament.registrationOpen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0f1e] via-[#0d1428] to-[#0a0f1e] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900/80 border border-slate-800 rounded-3xl p-8 text-center backdrop-blur-xl shadow-2xl space-y-6">
          {tournament.tournamentLogo ? (
            <img
              src={getImageUrl(tournament.tournamentLogo)}
              alt="Logo"
              className="w-20 h-20 rounded-2xl object-cover mx-auto border border-slate-700 shadow-xl"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-400 text-4xl">
              <Icon icon="solar:lock-keyhole-bold" />
            </div>
          )}

          <div className="space-y-1">
            <h1 className="text-2xl font-black text-white">{tournament.tournamentName}</h1>
            {tournament.season && (
              <p className="text-cyan-400 text-xs font-semibold">{tournament.season}</p>
            )}
          </div>

          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 text-red-400 font-bold text-sm uppercase tracking-wider">
              <Icon icon="solar:close-circle-bold" className="text-base" />
              Registration Currently Closed
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Player registrations for this tournament are currently closed by tournament administrators. No new player entries are being accepted at this time.
            </p>
          </div>

          <p className="text-slate-500 text-xs">
            Please contact the tournament organizers for further updates or check back later.
          </p>
        </div>
      </div>
    );
  }

  // ─── 4. Success Screen ─────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0f1e] via-[#0d1428] to-[#0a0f1e] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900/80 border border-slate-800 rounded-3xl p-8 text-center backdrop-blur-xl shadow-2xl space-y-6">
          {/* Animated success circle */}
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-2xl shadow-emerald-950/50 text-white text-4xl">
              <Icon icon="solar:check-circle-bold" />
            </div>
          </div>

          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white">Registration Confirmed!</h1>
            <p className="text-emerald-400 font-semibold text-sm mt-1">{tournament.tournamentName}</p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4 text-left">
            {photoPreview && (
              <div className="flex justify-center">
                <img
                  src={photoPreview}
                  alt="Player"
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-emerald-500/40 shadow-lg"
                />
              </div>
            )}
            <div className="text-center space-y-1">
              <p className="text-white font-black text-xl uppercase tracking-wide">{form.name}</p>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <span className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  {form.category}
                </span>
                {form.age && (
                  <span className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold px-2.5 py-0.5 rounded-full">
                    {form.age} yrs
                  </span>
                )}
              </div>
            </div>

            <div className="border-t border-slate-800 pt-3 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-500 block">Mobile</span>
                <span className="text-slate-300 font-mono font-semibold">+91 {form.phoneNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Village / City</span>
                <span className="text-slate-300 font-semibold truncate block">{form.fromWhere}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Batting</span>
                <span className="text-slate-300 font-semibold">{form.battingStyle}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Bowling</span>
                <span className="text-slate-300 font-semibold">{form.bowlingStyle}</span>
              </div>
            </div>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-xs text-emerald-300 leading-relaxed">
            Your player profile has been submitted and is now available in the auction pool for{" "}
            <span className="font-bold text-white">{tournament.tournamentName}</span>.
          </div>

          <div className="flex items-center gap-2 justify-center text-xs text-slate-500">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Auction status: Available for bidding</span>
          </div>
        </div>
      </div>
    );
  }

  // ─── 5. Active Registration Form ───────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f1e] via-[#0d1428] to-[#0a0f1e] text-white selection:bg-cyan-500/30">
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-cyan-600/10 blur-[130px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[450px] h-[350px] bg-indigo-600/10 blur-[140px] rounded-full" />
      </div>

      <div className="relative max-w-xl mx-auto px-4 py-8 pb-16">
        {/* Tournament Header */}
        <div className="text-center mb-8 space-y-3">
          {tournament.tournamentLogo ? (
            <img
              src={getImageUrl(tournament.tournamentLogo)}
              alt="Tournament Logo"
              className="w-20 h-20 rounded-2xl object-cover mx-auto border border-slate-700 shadow-xl"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-indigo-600/20 border border-cyan-500/20 flex items-center justify-center mx-auto text-4xl text-cyan-400">
              <Icon icon="solar:cup-star-bold" />
            </div>
          )}

          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white">
              {tournament.tournamentName}
            </h1>
            {tournament.season && (
              <p className="text-cyan-400 text-sm font-semibold mt-0.5">{tournament.season}</p>
            )}
          </div>

          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Registration Open
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-slate-900/75 border border-slate-800/80 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-2xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Icon icon="solar:user-plus-bold" className="text-cyan-400" />
              Player Registration
            </h2>
            <p className="text-slate-400 text-xs mt-0.5">
              Fill in your details below to register for the official tournament auction pool.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-4 text-xs flex items-start gap-2.5">
              <Icon icon="solar:danger-triangle-bold" className="text-base shrink-0 mt-0.5" />
              <p className="leading-relaxed">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="reg-name"
                type="text"
                autoComplete="name"
                value={form.name}
                onChange={(e) => {
                  setForm((p) => ({ ...p, name: e.target.value }));
                  setFieldErrors((p) => ({ ...p, name: "" }));
                }}
                placeholder="e.g. Rohit Sharma"
                className={`w-full bg-slate-800/80 border rounded-xl px-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                  fieldErrors.name
                    ? "border-red-500/60 focus:ring-red-500/30"
                    : "border-slate-700 focus:border-cyan-500 focus:ring-cyan-500/20"
                }`}
              />
              {fieldErrors.name && <p className="text-red-400 text-xs">{fieldErrors.name}</p>}
            </div>

            {/* Mobile Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Mobile Number (WhatsApp) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold select-none">
                  +91
                </span>
                <input
                  id="reg-phone"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  autoComplete="tel"
                  value={form.phoneNumber}
                  onChange={(e) => {
                    const v = e.target.value.replace(/[^0-9]/g, "").slice(0, 10);
                    setForm((p) => ({ ...p, phoneNumber: v }));
                    setFieldErrors((p) => ({ ...p, phoneNumber: "" }));
                  }}
                  placeholder="9876543210"
                  className={`w-full bg-slate-800/80 border rounded-xl pl-14 pr-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all font-mono ${
                    fieldErrors.phoneNumber
                      ? "border-red-500/60 focus:ring-red-500/30"
                      : "border-slate-700 focus:border-cyan-500 focus:ring-cyan-500/20"
                  }`}
                />
              </div>
              {fieldErrors.phoneNumber && <p className="text-red-400 text-xs">{fieldErrors.phoneNumber}</p>}
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Playing Category <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setForm((p) => ({ ...p, category: cat }));
                      setFieldErrors((p) => ({ ...p, category: "" }));
                    }}
                    className={`py-3 px-4 rounded-xl text-xs md:text-sm font-bold border transition-all text-left flex items-center gap-2 ${
                      form.category === cat
                        ? "bg-cyan-500/20 border-cyan-500/60 text-cyan-300 shadow-md shadow-cyan-950/50"
                        : "bg-slate-800/60 border-slate-700 text-slate-300 hover:border-slate-600 hover:bg-slate-800"
                    }`}
                  >
                    <span>
                      {cat === "Batsman" && "🏏"}
                      {cat === "Bowler" && "⚡"}
                      {cat === "All Rounder" && "⭐"}
                      {cat === "Wicket Keeper" && "🧤"}
                    </span>
                    <span>{cat}</span>
                  </button>
                ))}
              </div>
              {fieldErrors.category && <p className="text-red-400 text-xs">{fieldErrors.category}</p>}
            </div>

            {/* Batting & Bowling Style in a 2-col grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Batting Style */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Batting Style
                </label>
                <select
                  value={form.battingStyle}
                  onChange={(e) => setForm((p) => ({ ...p, battingStyle: e.target.value }))}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                >
                  {BATTING_STYLES.map((style) => (
                    <option key={style} value={style} className="bg-slate-900 text-white">
                      {style}
                    </option>
                  ))}
                </select>
              </div>

              {/* Bowling Style */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Bowling Style
                </label>
                <select
                  value={form.bowlingStyle}
                  onChange={(e) => setForm((p) => ({ ...p, bowlingStyle: e.target.value }))}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                >
                  {BOWLING_STYLES.map((style) => (
                    <option key={style} value={style} className="bg-slate-900 text-white">
                      {style}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Village & Age in a 2-col grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Village / City <span className="text-rose-500">*</span>
                </label>
                <input
                  id="reg-village"
                  type="text"
                  autoComplete="address-level2"
                  value={form.fromWhere}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, fromWhere: e.target.value }));
                    setFieldErrors((p) => ({ ...p, fromWhere: "" }));
                  }}
                  placeholder="e.g. Satara / Kudal"
                  className={`w-full bg-slate-800/80 border rounded-xl px-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                    fieldErrors.fromWhere
                      ? "border-red-500/60 focus:ring-red-500/30"
                      : "border-slate-700 focus:border-cyan-500 focus:ring-cyan-500/20"
                  }`}
                />
                {fieldErrors.fromWhere && <p className="text-red-400 text-xs">{fieldErrors.fromWhere}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Age (Years)
                </label>
                <input
                  id="reg-age"
                  type="number"
                  min={12}
                  max={75}
                  value={form.age}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, age: e.target.value }));
                    setFieldErrors((p) => ({ ...p, age: "" }));
                  }}
                  placeholder="e.g. 24"
                  className={`w-full bg-slate-800/80 border rounded-xl px-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                    fieldErrors.age
                      ? "border-red-500/60 focus:ring-red-500/30"
                      : "border-slate-700 focus:border-cyan-500 focus:ring-cyan-500/20"
                  }`}
                />
                {fieldErrors.age && <p className="text-red-400 text-xs">{fieldErrors.age}</p>}
              </div>
            </div>

            {/* Player Photo */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Player Photo <span className="text-rose-500">*</span>
              </label>

              {photoPreview ? (
                <div className="flex items-center gap-4 p-4 bg-slate-800/60 border border-slate-700 rounded-2xl">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-20 h-20 rounded-xl object-cover border-2 border-cyan-500/40 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{photoFile?.name}</p>
                    <p className="text-slate-400 text-xs mt-0.5">
                      {photoFile ? (photoFile.size / 1024 / 1024).toFixed(2) + " MB" : ""}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoFile(null);
                        setPhotoPreview(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="text-red-400 hover:text-red-300 text-xs mt-1.5 font-bold flex items-center gap-1"
                    >
                      <Icon icon="solar:trash-bin-trash-bold" />
                      Remove & choose another
                    </button>
                  </div>
                </div>
              ) : (
                <label
                  htmlFor="reg-photo"
                  className={`flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                    fieldErrors.photo
                      ? "border-red-500/50 bg-red-500/5"
                      : "border-slate-700 hover:border-cyan-500/50 hover:bg-cyan-500/5 bg-slate-800/30"
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-2xl">
                    <Icon icon="solar:camera-bold" />
                  </div>
                  <div className="text-center">
                    <p className="text-white font-semibold text-sm">Tap or drag to upload player photo</p>
                    <p className="text-slate-500 text-xs mt-0.5">JPG, JPEG, PNG, WEBP · Max 5 MB</p>
                  </div>
                </label>
              )}

              <input
                ref={fileInputRef}
                id="reg-photo"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handlePhotoChange}
                className="hidden"
              />
              {fieldErrors.photo && <p className="text-red-400 text-xs">{fieldErrors.photo}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              id="reg-submit-btn"
              className="w-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 disabled:opacity-60 disabled:pointer-events-none text-white font-black py-4 rounded-2xl text-sm uppercase tracking-wider shadow-2xl shadow-indigo-950/50 transition-all flex items-center justify-center gap-2 mt-4"
            >
              {submitting ? (
                <>
                  <Icon icon="solar:spinner-bold" className="text-lg animate-spin" />
                  Submitting Registration...
                </>
              ) : (
                <>
                  <Icon icon="solar:check-read-bold" className="text-lg" />
                  Submit Registration for {tournament.tournamentName}
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-xs mt-6 flex items-center justify-center gap-1.5">
          <Icon icon="solar:shield-check-bold" className="text-cyan-400" />
          <span>Independent Tournament Isolation · Scoped to Tournament #{tournament.id}</span>
        </p>
      </div>
    </div>
  );
}
