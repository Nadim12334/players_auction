"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { getImageUrl } from "../../../services/image";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5000";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const CATEGORIES = ["Batsman", "Bowler", "All Rounder", "Wicket Keeper"];

interface TournamentInfo {
  tournamentName: string;
  tournamentLogo: string | null;
  season: string | null;
  registrationOpen: boolean;
  slug: string;
}

export default function RegisterPage() {
  const params = useParams();
  const slug = (params?.tournamentSlug as string) || "kudal-premier-league";

  const [tournament, setTournament] = useState<TournamentInfo | null>(null);
  const [loadingTournament, setLoadingTournament] = useState(true);
  const [submitted, setSubmitted] = useState(false);
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
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchTournament();
  }, [slug]);

  const fetchTournament = async () => {
    setLoadingTournament(true);
    try {
      const res = await fetch(`${API_URL}/tournaments/public/${slug}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Tournament not found");
      setTournament(data);
    } catch (e: any) {
      setTournament({
        tournamentName: "Cricket Tournament",
        tournamentLogo: null,
        season: null,
        registrationOpen: true,
        slug,
      });
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
      setFieldErrors((p) => ({ ...p, photo: "Photo must be under 5 MB." }));
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
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

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
      formData.append("tournamentSlug", slug);
      if (photoFile) formData.append("photoFile", photoFile);

      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed.");
      setSubmitted(true);
    } catch (e: any) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Loading Skeleton ───────────────────────────────────────────────────────
  if (loadingTournament) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0f1e] via-[#0d1428] to-[#0a0f1e] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm font-medium animate-pulse">Loading tournament...</p>
        </div>
      </div>
    );
  }

  // ─── Registration Closed ────────────────────────────────────────────────────
  if (tournament && !tournament.registrationOpen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0f1e] via-[#0d1428] to-[#0a0f1e] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          {tournament.tournamentLogo && (
            <img
              src={getImageUrl(tournament.tournamentLogo)}
              alt="Logo"
              className="w-20 h-20 rounded-2xl object-cover mx-auto border border-slate-700"
            />
          )}
          <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
            <span className="text-4xl">🚫</span>
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">{tournament.tournamentName}</h1>
            <p className="text-slate-400 text-sm mt-1">{tournament.season}</p>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6">
            <p className="text-red-400 font-bold text-lg">Registration is Currently Closed</p>
            <p className="text-slate-400 text-sm mt-2">
              Player registrations for this tournament are not accepting new entries at this time. Please check back later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Success Screen ─────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0f1e] via-[#0d1428] to-[#0a0f1e] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          {/* Animated success circle */}
          <div className="relative mx-auto w-28 h-28">
            <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
            <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-2xl shadow-emerald-950/50">
              <span className="text-5xl">🎉</span>
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-black text-white">Registration Successful!</h1>
            <p className="text-emerald-400 font-semibold mt-1">{tournament?.tournamentName}</p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4 text-left backdrop-blur-sm">
            {photoPreview && (
              <div className="flex justify-center">
                <img src={photoPreview} alt="Player" className="w-24 h-24 rounded-full object-cover border-4 border-emerald-500/40" />
              </div>
            )}
            <div className="text-center space-y-1">
              <p className="text-white font-black text-xl uppercase tracking-wide">{form.name}</p>
              <p className="text-cyan-400 text-sm font-semibold">{form.category}</p>
              <p className="text-slate-400 text-xs">{form.fromWhere}</p>
            </div>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 space-y-2">
            <p className="text-emerald-300 font-bold">Your registration has been completed successfully.</p>
            <p className="text-slate-400 text-sm">
              Thank you for registering. You are now eligible for the player auction.
            </p>
          </div>

          <div className="flex items-center gap-2 justify-center text-xs text-slate-500">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Immediately added to auction pool</span>
          </div>
        </div>
      </div>
    );
  }

  // ─── Registration Form ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f1e] via-[#0d1428] to-[#0a0f1e] text-white selection:bg-cyan-500/30">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-cyan-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-indigo-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative max-w-lg mx-auto px-4 py-8 pb-16">
        {/* Tournament Header */}
        <div className="text-center mb-8 space-y-3">
          {tournament?.tournamentLogo ? (
            <img
              src={getImageUrl(tournament.tournamentLogo)}
              alt="Tournament Logo"
              className="w-20 h-20 rounded-2xl object-cover mx-auto border border-slate-700 shadow-xl"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-indigo-600/20 border border-cyan-500/20 flex items-center justify-center mx-auto">
              <span className="text-4xl">🏏</span>
            </div>
          )}

          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white">
              {tournament?.tournamentName || "Cricket Tournament"}
            </h1>
            {tournament?.season && (
              <p className="text-cyan-400 text-sm font-semibold mt-0.5">{tournament.season}</p>
            )}
          </div>

          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Registration Open
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-2xl space-y-6">
          <div>
            <h2 className="text-lg font-black text-white">Player Registration</h2>
            <p className="text-slate-400 text-xs mt-0.5">Fill in your details to register for the auction</p>
          </div>

          {/* Global error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-4 text-sm flex items-start gap-2">
              <span className="mt-0.5 shrink-0">⚠️</span>
              <p>{error}</p>
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
                placeholder="Enter your full name"
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
                Mobile Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold select-none">+91</span>
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
                  placeholder="10-digit mobile number"
                  className={`w-full bg-slate-800/80 border rounded-xl pl-12 pr-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
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
                Category <span className="text-rose-500">*</span>
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
                    className={`py-3 px-4 rounded-xl text-sm font-bold border transition-all text-left ${
                      form.category === cat
                        ? "bg-cyan-500/20 border-cyan-500/60 text-cyan-300"
                        : "bg-slate-800/60 border-slate-700 text-slate-300 hover:border-slate-600 hover:bg-slate-800"
                    }`}
                  >
                    {cat === "Batsman" && "🏏 "}
                    {cat === "Bowler" && "⚡ "}
                    {cat === "All Rounder" && "⭐ "}
                    {cat === "Wicket Keeper" && "🧤 "}
                    {cat}
                  </button>
                ))}
              </div>
              {fieldErrors.category && <p className="text-red-400 text-xs">{fieldErrors.category}</p>}
            </div>

            {/* Village / City */}
            <div className="space-y-1.5">
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
                placeholder="Enter your village or city"
                className={`w-full bg-slate-800/80 border rounded-xl px-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                  fieldErrors.fromWhere
                    ? "border-red-500/60 focus:ring-red-500/30"
                    : "border-slate-700 focus:border-cyan-500 focus:ring-cyan-500/20"
                }`}
              />
              {fieldErrors.fromWhere && <p className="text-red-400 text-xs">{fieldErrors.fromWhere}</p>}
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
                    className="w-20 h-20 rounded-xl object-cover border-2 border-cyan-500/40"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{photoFile?.name}</p>
                    <p className="text-slate-400 text-xs">{photoFile ? (photoFile.size / 1024 / 1024).toFixed(2) + " MB" : ""}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoFile(null);
                        setPhotoPreview(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="text-red-400 text-xs mt-1 hover:text-red-300 font-semibold"
                    >
                      Remove Photo
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
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                    <span className="text-2xl">📷</span>
                  </div>
                  <div className="text-center">
                    <p className="text-white font-semibold text-sm">Tap to upload your photo</p>
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
              className="w-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 disabled:opacity-60 disabled:pointer-events-none text-white font-black py-4 rounded-2xl text-sm uppercase tracking-wider shadow-2xl shadow-indigo-950/50 transition-all flex items-center justify-center gap-2 mt-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting Registration...
                </>
              ) : (
                <>
                  <span>🏏</span>
                  Register for Auction
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-600 text-xs mt-8">
          Registration is free · No approval required · Immediately eligible for auction
        </p>
      </div>
    </div>
  );
}
