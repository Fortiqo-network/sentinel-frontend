"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarPicker } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/auth";
import { updateProfile } from "@/lib/api/auth";
import { cn } from "@/lib/utils/cn";

type SaveState = "idle" | "saving" | "saved" | "error";

/**
 * Profile settings panel shared by the buyer and developer portals. Edits the
 * display name and avatar preset, persists via PATCH /v1/auth/me, and updates
 * the client auth store so the header reflects the change immediately.
 *
 * @example
 * <ProfileSettingsCard />
 */
export function ProfileSettingsCard(): React.JSX.Element {
  const { user, setUser } = useAuthStore();
  const [displayName, setDisplayName] = React.useState(user?.displayName ?? "");
  const [avatar, setAvatar] = React.useState(user?.avatarUrl ?? "");
  const [state, setState] = React.useState<SaveState>("idle");

  React.useEffect(() => {
    setDisplayName(user?.displayName ?? "");
    setAvatar(user?.avatarUrl ?? "");
  }, [user]);

  const dirty = displayName !== (user?.displayName ?? "") || avatar !== (user?.avatarUrl ?? "");

  async function handleSave(): Promise<void> {
    setState("saving");
    try {
      const updated = await updateProfile({ displayName: displayName.trim() || undefined, avatarUrl: avatar });
      setUser(updated);
      setState("saved");
    } catch {
      setState("error");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Your name and avatar as shown across Sentinel.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar src={avatar} name={displayName || user?.email} size="xl" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800">{displayName || "Your name"}</p>
            <p className="truncate text-xs text-slate-400">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="displayName" className="text-sm font-medium text-slate-700">
            Display name
          </label>
          <input
            id="displayName"
            value={displayName}
            onChange={(e) => {
              setDisplayName(e.target.value);
              setState("idle");
            }}
            placeholder="e.g. Alex Fernandes"
            className="sentinel-focus block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400"
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">Avatar</p>
          <AvatarPicker value={avatar} onSelect={(v) => { setAvatar(v); setState("idle"); }} name={displayName || user?.email} />
          <p className="text-xs text-slate-400">Choose a preset. Uploading a custom image is coming soon.</p>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={handleSave} disabled={!dirty || state === "saving"}>
            {state === "saving" ? "Saving…" : "Save changes"}
          </Button>
          <span
            className={cn(
              "text-sm",
              state === "saved" && "text-emerald-600",
              state === "error" && "text-rose-600",
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
