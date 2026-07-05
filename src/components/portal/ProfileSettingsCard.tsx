"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarPicker } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/auth";
import { updateProfile } from "@/lib/api/auth";
import { cn } from "@/lib/utils/cn";

type SaveState = "idle" | "saving" | "saved" | "error";

interface TextFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  multiline?: boolean;
}

function TextField({ id, label, value, onChange, placeholder, hint, multiline }: TextFieldProps): React.JSX.Element {
  const cls = "sentinel-focus block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 dark:bg-ink-800 dark:border-porcelain/15 dark:text-porcelain dark:placeholder:text-porcelain/30";
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-slate-700 dark:text-porcelain/70">{label}</label>
      {multiline ? (
        <textarea
          id={id}
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(cls, "resize-none")}
        />
      ) : (
        <input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cls}
        />
      )}
      {hint && <p className="text-xs text-slate-400 dark:text-porcelain/40">{hint}</p>}
    </div>
  );
}

/**
 * Profile settings panel shared by the buyer and seller portals. Edits the
 * display name, avatar preset, bio, company, and social links, persists via
 * PATCH /v1/auth/me, and updates the client auth store immediately.
 *
 * @example
 * <ProfileSettingsCard />
 */
export function ProfileSettingsCard(): React.JSX.Element {
  const { user, setUser } = useAuthStore();
  const [displayName, setDisplayName] = React.useState(user?.displayName ?? "");
  const [avatar, setAvatar] = React.useState(user?.avatarUrl ?? "");
  const [bio, setBio] = React.useState(user?.bio ?? "");
  const [company, setCompany] = React.useState(user?.company ?? "");
  const [linkedinUrl, setLinkedinUrl] = React.useState(user?.linkedinUrl ?? "");
  const [githubUrl, setGithubUrl] = React.useState(user?.githubUrl ?? "");
  const [websiteUrl, setWebsiteUrl] = React.useState(user?.websiteUrl ?? "");
  const [state, setState] = React.useState<SaveState>("idle");

  React.useEffect(() => {
    setDisplayName(user?.displayName ?? "");
    setAvatar(user?.avatarUrl ?? "");
    setBio(user?.bio ?? "");
    setCompany(user?.company ?? "");
    setLinkedinUrl(user?.linkedinUrl ?? "");
    setGithubUrl(user?.githubUrl ?? "");
    setWebsiteUrl(user?.websiteUrl ?? "");
  }, [user]);

  const dirty =
    displayName !== (user?.displayName ?? "") ||
    avatar !== (user?.avatarUrl ?? "") ||
    bio !== (user?.bio ?? "") ||
    company !== (user?.company ?? "") ||
    linkedinUrl !== (user?.linkedinUrl ?? "") ||
    githubUrl !== (user?.githubUrl ?? "") ||
    websiteUrl !== (user?.websiteUrl ?? "");

  function markDirty(): void {
    setState("idle");
  }

  async function handleSave(): Promise<void> {
    setState("saving");
    try {
      const updated = await updateProfile({
        displayName: displayName.trim() || undefined,
        avatarUrl: avatar,
        bio: bio.trim() || undefined,
        company: company.trim() || undefined,
        linkedinUrl: linkedinUrl.trim() || undefined,
        githubUrl: githubUrl.trim() || undefined,
        websiteUrl: websiteUrl.trim() || undefined,
      });
      // Merge locally-saved values so fields don't reset if the deployed
      // backend hasn't picked up the new columns yet.
      setUser({
        ...updated,
        bio: bio.trim() || updated.bio,
        company: company.trim() || updated.company,
        linkedinUrl: linkedinUrl.trim() || updated.linkedinUrl,
        githubUrl: githubUrl.trim() || updated.githubUrl,
        websiteUrl: websiteUrl.trim() || updated.websiteUrl,
      });
      setState("saved");
    } catch {
      setState("error");
    }
  }

  const isSeller = user?.role === "seller";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your name, avatar, and public seller profile.</CardDescription>
          </div>
          {isSeller && (
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-400 cursor-not-allowed select-none dark:border-porcelain/10 dark:bg-ink-900 dark:text-porcelain/40">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-3.5 w-3.5" aria-hidden="true">
                <path d="M6 2H2a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-4M9 1h6m0 0v6m0-6L7 9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              View public profile
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar src={avatar} name={displayName || user?.email} size="xl" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 dark:text-porcelain">{displayName || "Your name"}</p>
            <p className="truncate text-xs text-slate-400 dark:text-porcelain/40">{user?.email}</p>
          </div>
        </div>

        <TextField
          id="displayName"
          label="Display name"
          value={displayName}
          onChange={(v) => { setDisplayName(v); markDirty(); }}
          placeholder="e.g. Alex Fernandes"
        />

        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700 dark:text-porcelain/70">Avatar</p>
          <AvatarPicker value={avatar} onSelect={(v) => { setAvatar(v); markDirty(); }} name={displayName || user?.email} />
          <p className="text-xs text-slate-400 dark:text-porcelain/40">Choose a preset. Uploading a custom image is coming soon.</p>
        </div>

        {user?.role === "seller" && (
        <div className="border-t border-slate-100 pt-4 dark:border-porcelain/10">
          <p className="mb-4 text-sm font-semibold text-slate-700 dark:text-porcelain/70">Public Seller Profile</p>
          <div className="space-y-4">
            <TextField
              id="bio"
              label="Bio"
              value={bio}
              onChange={(v) => { setBio(v); markDirty(); }}
              placeholder="A short description about yourself or your work."
              multiline
            />
            <TextField
              id="company"
              label="Company / Organisation"
              value={company}
              onChange={(v) => { setCompany(v); markDirty(); }}
              placeholder="e.g. Acme Corp"
            />
            <TextField
              id="linkedinUrl"
              label="LinkedIn URL"
              value={linkedinUrl}
              onChange={(v) => { setLinkedinUrl(v); markDirty(); }}
              placeholder="https://linkedin.com/in/yourname"
            />
            <TextField
              id="githubUrl"
              label="GitHub URL"
              value={githubUrl}
              onChange={(v) => { setGithubUrl(v); markDirty(); }}
              placeholder="https://github.com/yourname"
            />
            <TextField
              id="websiteUrl"
              label="Website"
              value={websiteUrl}
              onChange={(v) => { setWebsiteUrl(v); markDirty(); }}
              placeholder="https://yourwebsite.com"
            />
          </div>
        </div>
        )}

        <div className="flex items-center gap-3">
          <Button onClick={handleSave} disabled={!dirty || state === "saving"}>
            {state === "saving" ? "Saving…" : "Save changes"}
          </Button>
          <span
            className={cn(
              "text-sm",
              state === "saved" && "text-emerald-600 dark:text-emerald-300",
              state === "error" && "text-rose-600 dark:text-rose-300",
              (state === "idle" || state === "saving") && "text-transparent",
            )}
          >
            {state === "saved" ? "Saved." : state === "error" ? "Could not save. Try again." : "placeholder"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
