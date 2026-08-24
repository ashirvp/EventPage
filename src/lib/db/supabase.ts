import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { seedInvite } from "../seed";
import type { Invite, Locale, Rsvp, Wish } from "../types";
import type { NewRsvp, NewWish, Store, SubmissionKind } from "./index";

/**
 * Server-only. Holds the service role, so every query filters on owner_id
 * explicitly — the checks in this file are the enforcement, and the RLS
 * policies in supabase/schema.sql are the second line of defence covering
 * anything that reaches PostgREST with the anon key.
 */
function client(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

const SELECT = "*, events(*), families(*), verses(*)";

/** Explicit columns: `*` would send guests' ip_hash to the couple's browser. */
const RSVP_COLUMNS = "id,invite_id,name,attending,guest_count,message,created_at";
const WISH_COLUMNS = "id,invite_id,name,message,status,created_at";

/* eslint-disable @typescript-eslint/no-explicit-any */
function toInvite(r: any): Invite {
  return {
    id: r.id,
    ownerId: r.owner_id,
    slug: r.slug,
    status: r.status,
    slugLocked: r.slug_locked ?? false,
    locale: r.locale,
    tradition: r.tradition ?? "islamic",
    theme: r.theme,
    opener: r.opener,
    timezone: r.timezone,
    partnerAName: r.partner_a_name,
    partnerBName: r.partner_b_name,
    heroImage: r.hero_image,
    inviteCard: r.invite_card,
    sections: r.sections ?? {},
    rsvpDeadline: r.rsvp_deadline,
    infoWeather: r.info_weather,
    infoDress: r.info_dress,
    infoParking: r.info_parking,
    events: (r.events ?? [])
      .sort((a: any, b: any) => a.sort - b.sort)
      .map((e: any) => ({
        id: e.id,
        sort: e.sort,
        presetKey: e.preset_key,
        customName: e.custom_name,
        venueName: e.venue_name,
        venueAddress: e.venue_address,
        mapsUrl: e.maps_url,
        startsAt: new Date(e.starts_at).toISOString(),
        note: e.note,
      })),
    families: (r.families ?? []).map((f: any) => ({
      id: f.id,
      side: f.side,
      personName: f.person_name,
      parents: f.parents,
      grandparents: f.grandparents,
    })),
    verses: (r.verses ?? [])
      .sort((a: any, b: any) => a.sort - b.sort)
      .map((v: any) => ({
        id: v.id,
        sort: v.sort,
        libraryKey: v.library_key,
        customArabic: v.custom_arabic,
        customText: v.custom_text,
        customRef: v.custom_ref,
      })),
    updatedAt: r.updated_at,
  };
}

function inviteColumns(p: Partial<Invite>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const map: Record<string, string> = {
    slug: "slug", slugLocked: "slug_locked", status: "status",
    locale: "locale", tradition: "tradition", theme: "theme",
    opener: "opener", timezone: "timezone", partnerAName: "partner_a_name",
    partnerBName: "partner_b_name", heroImage: "hero_image",
    inviteCard: "invite_card", sections: "sections",
    rsvpDeadline: "rsvp_deadline", infoWeather: "info_weather",
    infoDress: "info_dress", infoParking: "info_parking",
  };
  for (const [k, col] of Object.entries(map)) {
    if (k in p) out[col] = (p as any)[k];
  }
  out.updated_at = new Date().toISOString();
  return out;
}

/** Children are small and always rewritten together; replace rather than diff. */
async function replaceChildren(db: SupabaseClient, invite: Invite) {
  await Promise.all([
    db.from("events").delete().eq("invite_id", invite.id),
    db.from("families").delete().eq("invite_id", invite.id),
    db.from("verses").delete().eq("invite_id", invite.id),
  ]);
  if (invite.events.length) {
    await db.from("events").insert(
      invite.events.map((e, i) => ({
        invite_id: invite.id, sort: i, preset_key: e.presetKey,
        custom_name: e.customName, venue_name: e.venueName,
        venue_address: e.venueAddress, maps_url: e.mapsUrl,
        starts_at: e.startsAt, note: e.note,
      })),
    );
  }
  if (invite.families.length) {
    await db.from("families").insert(
      invite.families.map((f) => ({
        invite_id: invite.id, side: f.side, person_name: f.personName,
        parents: f.parents, grandparents: f.grandparents,
      })),
    );
  }
  if (invite.verses.length) {
    await db.from("verses").insert(
      invite.verses.map((v, i) => ({
        invite_id: invite.id, sort: i, library_key: v.libraryKey,
        custom_arabic: v.customArabic, custom_text: v.customText,
        custom_ref: v.customRef,
      })),
    );
  }
}

export function supabaseStore(): Store {
  const db = client();

  return {
    async getPublishedBySlug(slug) {
      const { data } = await db.from("invites").select(SELECT)
        .eq("slug", slug).eq("status", "published").maybeSingle();
      return data ? toInvite(data) : null;
    },
    async getPublishedById(id) {
      const { data } = await db.from("invites").select(SELECT)
        .eq("id", id).eq("status", "published").maybeSingle();
      return data ? toInvite(data) : null;
    },
    async getInvite(id, ownerId) {
      const { data } = await db.from("invites").select(SELECT)
        .eq("id", id).eq("owner_id", ownerId).maybeSingle();
      return data ? toInvite(data) : null;
    },
    async listInvites(ownerId) {
      const { data } = await db.from("invites").select(SELECT)
        .eq("owner_id", ownerId).order("updated_at", { ascending: false });
      return (data ?? []).map(toInvite);
    },
    async createInvite(ownerId, locale: Locale) {
      const draft = seedInvite({ id: "pending", ownerId, locale });
      let slug = draft.slug;
      for (let n = 2; await this.slugTaken(slug, ""); n++) {
        slug = `${draft.slug}-${n}`;
      }
      const { data, error } = await db.from("invites")
        .insert({ owner_id: ownerId, ...inviteColumns({ ...draft, slug }) })
        .select("*").single();
      if (error) throw error;

      const created = toInvite({ ...data, events: [], families: [], verses: [] });
      await replaceChildren(db, { ...draft, id: created.id });
      return (await this.getInvite(created.id, ownerId))!;
    },
    async updateInvite(id, ownerId, patch) {
      const current = await this.getInvite(id, ownerId);
      if (!current) throw new Error("Not found");

      const { error } = await db.from("invites")
        .update(inviteColumns(patch)).eq("id", id).eq("owner_id", ownerId);
      if (error) throw error;

      if (patch.events || patch.families || patch.verses) {
        await replaceChildren(db, { ...current, ...patch, id });
      }
      return (await this.getInvite(id, ownerId))!;
    },
    async deleteInvite(id, ownerId) {
      await db.from("invites").delete().eq("id", id).eq("owner_id", ownerId);
    },
    async slugTaken(slug, exceptId) {
      const { data } = await db.from("invites").select("id").eq("slug", slug);
      return (data ?? []).some((r: any) => r.id !== exceptId);
    },

    async countRecentSubmissions(kind: SubmissionKind, ipHash, sinceIso) {
      const { count } = await db.from(kind)
        .select("id", { count: "exact", head: true })
        .eq("ip_hash", ipHash).gte("created_at", sinceIso);
      return count ?? 0;
    },

    async addRsvp(inviteId, r: NewRsvp) {
      await db.from("rsvps").insert({
        invite_id: inviteId, name: r.name, attending: r.attending,
        guest_count: r.guestCount, message: r.message, ip_hash: r.ipHash,
      });
    },
    async listRsvps(inviteId, ownerId) {
      if (!(await this.getInvite(inviteId, ownerId))) return [];
      const { data } = await db.from("rsvps").select(RSVP_COLUMNS)
        .eq("invite_id", inviteId).order("created_at", { ascending: false });
      return (data ?? []).map((r: any): Rsvp => ({
        id: r.id, inviteId: r.invite_id, name: r.name, attending: r.attending,
        guestCount: r.guest_count, message: r.message, createdAt: r.created_at,
      }));
    },
    async countRsvps(inviteId, ownerId) {
      const rows = await this.listRsvps(inviteId, ownerId);
      return {
        yes: rows.filter((r) => r.attending).length,
        no: rows.filter((r) => !r.attending).length,
        guests: rows.filter((r) => r.attending).reduce((s, r) => s + r.guestCount, 0),
      };
    },

    async addWish(inviteId, w: NewWish) {
      await db.from("wishes").insert({
        invite_id: inviteId, name: w.name, message: w.message,
        status: "pending", ip_hash: w.ipHash,
      });
    },
    async listApprovedWishes(inviteId) {
      const { data } = await db.from("wishes").select(WISH_COLUMNS)
        .eq("invite_id", inviteId).eq("status", "approved")
        .order("created_at", { ascending: false });
      return (data ?? []).map(toWish);
    },
    async listAllWishes(inviteId, ownerId) {
      if (!(await this.getInvite(inviteId, ownerId))) return [];
      const { data } = await db.from("wishes").select(WISH_COLUMNS)
        .eq("invite_id", inviteId).order("created_at", { ascending: false });
      return (data ?? []).map(toWish);
    },
    async setWishStatus(id, ownerId, status) {
      const { data } = await db.from("wishes").select("invite_id").eq("id", id).maybeSingle();
      if (!data) return;
      if (!(await this.getInvite((data as any).invite_id, ownerId))) return;
      await db.from("wishes").update({ status }).eq("id", id);
    },
  };
}

function toWish(w: any): Wish {
  return {
    id: w.id, inviteId: w.invite_id, name: w.name,
    message: w.message, status: w.status, createdAt: w.created_at,
  };
}
