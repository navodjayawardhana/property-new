"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { UserAvatar } from "@/components/UserAvatar";
import Footer from "@/components/Footer";
import { useAuth } from "@/lib/auth-context";
import { profile as profileApi } from "@/lib/api";
import { COUNTRY_CODES, parsePhone } from "@/lib/countries";
import {
  Camera, Trash2, Loader2, Check, Eye, EyeOff,
  Shield, Phone, Mail, UserIcon, MapPin, ChevronDown,
} from "lucide-react";

type Tab = "personal" | "password" | "account";

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  buyer:  { label: "Buyer",  color: "bg-blue-100 text-blue-700" },
  seller: { label: "Seller", color: "bg-green-100 text-green-700" },
  agent:  { label: "Agent",  color: "bg-purple-100 text-purple-700" },
  admin:  { label: "Admin",  color: "bg-red-100 text-red-700" },
};

const TABS: { id: Tab; label: string }[] = [
  { id: "personal", label: "Personal Information" },
  { id: "password", label: "Password Reset" },
  { id: "account",  label: "Account Details" },
];

export default function ProfilePage() {
  const { user, token, loading, updateUser } = useAuth();
  const router    = useRouter();
  const avatarRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<Tab>("personal");

  // Personal info
  const [name, setName]               = useState("");
  const [email, setEmail]             = useState("");
  const [phoneDialCode, setPhoneDialCode] = useState("+94");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [suburb, setSuburb]           = useState("");
  const [userState, setUserState]     = useState("");
  const [postcode, setPostcode]       = useState("");
  const [country, setCountry]         = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg]   = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // Password
  const [currentPw, setCurrentPw]   = useState("");
  const [newPw, setNewPw]           = useState("");
  const [confirmPw, setConfirmPw]   = useState("");
  const [showPw, setShowPw]         = useState(false);
  const [savingPw, setSavingPw]     = useState(false);
  const [pwMsg, setPwMsg]           = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // Avatar
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/signin");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setEmail(user.email ?? "");
    if (user.phone) {
      const { dialCode, number } = parsePhone(user.phone);
      setPhoneDialCode(dialCode);
      setPhoneNumber(number);
    }
    setSuburb(user.suburb ?? "");
    setUserState(user.state ?? "");
    setPostcode(user.postcode ?? "");
    setCountry(user.country ?? "");
  }, [user]);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    setAvatarLoading(true);
    setAvatarPreview(URL.createObjectURL(file));
    try {
      const fd = new FormData();
      fd.append("avatar", file);
      updateUser(await profileApi.uploadAvatar(fd, token));
      setAvatarPreview(null);
    } catch (err: unknown) {
      setAvatarPreview(null);
      alert((err as Error).message ?? "Upload failed");
    } finally {
      setAvatarLoading(false);
      if (avatarRef.current) avatarRef.current.value = "";
    }
  }

  async function handleRemoveAvatar() {
    if (!token || !user?.avatar) return;
    if (!confirm("Remove your profile photo?")) return;
    setAvatarLoading(true);
    try { updateUser(await profileApi.deleteAvatar(token)); }
    catch { /* ignore */ }
    finally { setAvatarLoading(false); }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSavingProfile(true);
    setProfileMsg(null);
    const rawNumber = phoneNumber.trim().replace(/^0+/, "");
    try {
      updateUser(await profileApi.update({
        name, email,
        phone:    rawNumber ? `${phoneDialCode}${rawNumber}` : null,
        suburb:   suburb    || null,
        state:    userState || null,
        postcode: postcode  || null,
        country:  country   || null,
      }, token));
      setProfileMsg({ type: "ok", text: "Profile updated successfully." });
    } catch (err: unknown) {
      const e = err as Error & { errors?: Record<string, string[]> };
      setProfileMsg({ type: "err", text: e.errors ? Object.values(e.errors).flat().join(" · ") : (e.message ?? "Update failed") });
    } finally { setSavingProfile(false); }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    if (newPw !== confirmPw) { setPwMsg({ type: "err", text: "New passwords do not match." }); return; }
    setSavingPw(true);
    setPwMsg(null);
    try {
      await profileApi.updatePassword({ current_password: currentPw, password: newPw, password_confirmation: confirmPw }, token);
      setPwMsg({ type: "ok", text: "Password changed successfully." });
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
    } catch (err: unknown) {
      const e = err as Error & { errors?: Record<string, string[]> };
      setPwMsg({ type: "err", text: e.errors ? Object.values(e.errors).flat().join(" · ") : (e.message ?? "Failed to change password") });
    } finally { setSavingPw(false); }
  }

  if (loading || !user) return null;

  const avatarSrc = avatarPreview ?? user.avatar;
  const role = ROLE_LABELS[user.role] ?? { label: user.role, color: "bg-gray-100 text-gray-600" };
  const inp  = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#16a34a] transition-colors bg-white";
  const lbl  = "block text-xs font-semibold text-gray-600 mb-1.5";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="bg-[#16a34a] py-8 px-4">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-white/20 flex items-center justify-center shrink-0">
            <UserIcon size={20} className="text-white" />
          </div>
          <div>
            <p className="text-green-300 text-xs font-bold uppercase tracking-widest">Settings</p>
            <h1 className="text-white font-black text-2xl mt-0.5">My Profile</h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 w-full flex-1">

        {/* ── Avatar card (always visible) ── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-[#16a34a] flex items-center justify-center">
                <UserAvatar src={avatarSrc} name={user.name} avatarBg="bg-[#16a34a]" textSize="text-2xl" />
              </div>
              {avatarLoading && (
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                  <Loader2 size={18} className="animate-spin text-white" />
                </div>
              )}
            </div>
            <div>
              <p className="font-bold text-gray-900">{user.name}</p>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${role.color}`}>{role.label}</span>
              <div className="flex gap-2 mt-3">
                <button type="button" onClick={() => avatarRef.current?.click()} disabled={avatarLoading}
                  className="flex items-center gap-1.5 text-xs font-semibold bg-[#16a34a] text-white px-3 py-1.5 rounded-lg hover:bg-[#15803d] transition-colors disabled:opacity-50">
                  <Camera size={12} /> Change photo
                </button>
                {user.avatar && (
                  <button type="button" onClick={handleRemoveAvatar} disabled={avatarLoading}
                    className="flex items-center gap-1.5 text-xs font-semibold text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50">
                    <Trash2 size={12} /> Remove
                  </button>
                )}
              </div>
            </div>
          </div>
          <input ref={avatarRef} type="file" accept="image/jpeg,image/png,image/jpg,image/webp" className="hidden" onChange={handleAvatarChange} />
        </div>

        {/* ── Tab bar ── */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-100">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3.5 text-xs font-bold tracking-wide transition-colors relative whitespace-nowrap px-2 ${
                  activeTab === tab.id
                    ? "text-[#16a34a]"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#16a34a] rounded-t-full" />
                )}
              </button>
            ))}
          </div>

          <div className="p-6">

            {/* ── Personal Information ── */}
            {activeTab === "personal" && (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className={lbl}><span className="flex items-center gap-1.5"><UserIcon size={11} /> Full Name</span></label>
                  <input required className={inp} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
                </div>

                <div>
                  <label className={lbl}><span className="flex items-center gap-1.5"><Mail size={11} /> Email Address</span></label>
                  <input required type="email" className={inp} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                </div>

                <div>
                  <label className={lbl}><span className="flex items-center gap-1.5"><Phone size={11} /> Phone Number</span></label>
                  <div className="flex gap-2">
                    <div className="relative shrink-0">
                      <select
                        value={phoneDialCode}
                        onChange={(e) => setPhoneDialCode(e.target.value)}
                        className="h-full pl-3 pr-7 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#16a34a] bg-white appearance-none cursor-pointer"
                        style={{ minWidth: "90px" }}
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option key={c.code} value={c.dial}>{c.flag} {c.dial}</option>
                        ))}
                      </select>
                      <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                    <input type="tel" className={inp} value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="400 000 000" />
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs font-semibold text-gray-500 flex items-center gap-1.5 mb-3"><MapPin size={11} /> Location</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className={lbl}>Country</label>
                      <div className="relative">
                        <select className={inp + " appearance-none pr-8 cursor-pointer"} value={country} onChange={(e) => setCountry(e.target.value)}>
                          <option value="">Select country</option>
                          {COUNTRY_CODES.map((c) => (
                            <option key={c.code} value={c.name}>{c.flag} {c.name}</option>
                          ))}
                        </select>
                        <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className={lbl}>State / Region</label>
                      <input className={inp} value={userState} onChange={(e) => setUserState(e.target.value)} placeholder="e.g. New South Wales" />
                    </div>
                    <div>
                      <label className={lbl}>Postcode</label>
                      <input className={inp} value={postcode} onChange={(e) => setPostcode(e.target.value)} placeholder="e.g. 3121" maxLength={10} />
                    </div>
                    <div className="col-span-2">
                      <label className={lbl}>Suburb / City</label>
                      <input className={inp} value={suburb} onChange={(e) => setSuburb(e.target.value)} placeholder="e.g. Richmond" />
                    </div>
                  </div>
                </div>

                {profileMsg && (
                  <div className={`text-sm px-3 py-2 rounded-lg ${profileMsg.type === "ok" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                    {profileMsg.text}
                  </div>
                )}

                <button type="submit" disabled={savingProfile}
                  className="flex items-center gap-2 bg-[#16a34a] hover:bg-[#15803d] disabled:bg-gray-200 disabled:cursor-not-allowed text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors">
                  {savingProfile ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  Save changes
                </button>
              </form>
            )}

            {/* ── Password Reset ── */}
            {activeTab === "password" && (
              <form onSubmit={handleChangePassword} className="space-y-4">
                <p className="text-xs text-gray-400 -mt-1 mb-2">Update your password. You&apos;ll need to enter your current password to confirm.</p>

                <div>
                  <label className={lbl}><span className="flex items-center gap-1.5"><Shield size={11} /> Current Password</span></label>
                  <div className="relative">
                    <input required type={showPw ? "text" : "password"} className={inp + " pr-10"} value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} placeholder="Enter current password" />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className={lbl}>New Password</label>
                  <input required type={showPw ? "text" : "password"} className={inp} value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="Min 8 characters" minLength={8} />
                </div>

                <div>
                  <label className={lbl}>Confirm New Password</label>
                  <input required type={showPw ? "text" : "password"} className={inp} value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder="Repeat new password" />
                </div>

                {pwMsg && (
                  <div className={`text-sm px-3 py-2 rounded-lg ${pwMsg.type === "ok" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                    {pwMsg.text}
                  </div>
                )}

                <button type="submit" disabled={savingPw}
                  className="flex items-center gap-2 bg-[#16a34a] hover:bg-[#15803d] disabled:bg-gray-200 disabled:cursor-not-allowed text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors">
                  {savingPw ? <Loader2 size={14} className="animate-spin" /> : <Shield size={14} />}
                  Update password
                </button>
              </form>
            )}

            {/* ── Account Details ── */}
            {activeTab === "account" && (
              <dl className="space-y-4 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <dt className="text-gray-500 font-medium">Account type</dt>
                  <dd><span className={`font-semibold text-xs px-2.5 py-1 rounded-full ${role.color}`}>{role.label}</span></dd>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <dt className="text-gray-500 font-medium">User ID</dt>
                  <dd className="text-gray-700 font-mono text-xs bg-gray-100 px-2.5 py-1 rounded-lg">#{user.id}</dd>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <dt className="text-gray-500 font-medium">Email</dt>
                  <dd className="text-gray-700 text-xs">{user.email ?? "—"}</dd>
                </div>
                <div className="flex justify-between items-center py-2">
                  <dt className="text-gray-500 font-medium">Phone</dt>
                  <dd className="text-gray-700 text-xs">{user.phone ?? "—"}</dd>
                </div>
              </dl>
            )}

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
