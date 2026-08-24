import { seedInvite } from "../seed";
import type { Invite, Locale, Rsvp, Wish } from "../types";
import type { NewRsvp, NewWish, Store, SubmissionKind } from "./index";

/**
 * Runs Davet with no database at all: everything renders, nothing survives a
 * restart. This exists so the app is previewable before Supabase is wired up.
 */

export const DEMO_OWNER = "demo-owner";

/** IP hashes are kept beside the records, never inside the types handed to
 *  the couple's browser. */
type Submission = { kind: SubmissionKind; ipHash: string; at: number };
type Data = {
  invites: Map<string, Invite>;
  rsvps: Rsvp[];
  wishes: Wish[];
  submissions: Submission[];
};

const g = globalThis as unknown as { __davetDemo?: Data };

function bootstrap(): Data {
  const invite = seedInvite({ id: "demo", ownerId: DEMO_OWNER, locale: "en" });
  invite.slug = "amir-leyla";
  invite.status = "published";
  invite.sections.music = false;

  const wishes: Wish[] = [
    {
      id: "w1",
      inviteId: "demo",
      name: "Fathima",
      message:
        "May your home always be full of laughter, du'as, and each other's company.",
      status: "approved",
      createdAt: new Date().toISOString(),
    },
    {
      id: "w2",
      inviteId: "demo",
      name: "Yusuf & Elif",
      message: "Wishing you both a lifetime of patience and joy. Mubarak!",
      status: "approved",
      createdAt: new Date().toISOString(),
    },
  ];

  return { invites: new Map([[invite.id, invite]]), rsvps: [], wishes, submissions: [] };
}

function data(): Data {
  if (!g.__davetDemo) g.__davetDemo = bootstrap();
  return g.__davetDemo;
}

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));
const id = () => Math.random().toString(36).slice(2, 10);

export function demoStore(): Store {
  return {
    async getPublishedBySlug(slug) {
      for (const inv of data().invites.values()) {
        if (inv.slug === slug && inv.status === "published") return clone(inv);
      }
      return null;
    },
    async getPublishedById(inviteId) {
      let inv = data().invites.get(inviteId);
      if (!inv && inviteId !== "demo") {
        inv = seedInvite({ id: inviteId, ownerId: DEMO_OWNER, locale: "en" });
        inv.status = "published";
        data().invites.set(inviteId, inv);
      }
      return inv && inv.status === "published" ? clone(inv) : null;
    },
    async getInvite(inviteId, ownerId) {
      let inv = data().invites.get(inviteId);
      if (!inv && ownerId === DEMO_OWNER) {
        inv = seedInvite({ id: inviteId, ownerId, locale: "en" });
        data().invites.set(inviteId, inv);
      }
      return inv && inv.ownerId === ownerId ? clone(inv) : null;
    },
    async listInvites(ownerId) {
      return [...data().invites.values()]
        .filter((i) => i.ownerId === ownerId)
        .map(clone);
    },
    async createInvite(ownerId, locale: Locale) {
      const inv = seedInvite({ id: id(), ownerId, locale });
      let slug = inv.slug;
      let n = 2;
      while ([...data().invites.values()].some((i) => i.slug === slug)) {
        slug = `${inv.slug}-${n++}`;
      }
      inv.slug = slug;
      data().invites.set(inv.id, inv);
      return clone(inv);
    },
    async updateInvite(inviteId, ownerId, patch) {
      let inv = data().invites.get(inviteId);
      if (!inv && ownerId === DEMO_OWNER) {
        inv = seedInvite({ id: inviteId, ownerId, locale: "en" });
        data().invites.set(inviteId, inv);
      }
      if (!inv || inv.ownerId !== ownerId) throw new Error("Not found");
      const next = { ...inv, ...patch, id: inv.id, ownerId: inv.ownerId, updatedAt: new Date().toISOString() };
      data().invites.set(inviteId, next);
      return clone(next);
    },
    async deleteInvite(inviteId, ownerId) {
      const inv = data().invites.get(inviteId);
      if (inv && inv.ownerId === ownerId) {
        data().invites.delete(inviteId);
        const d = data();
        d.rsvps = d.rsvps.filter((r) => r.inviteId !== inviteId);
        d.wishes = d.wishes.filter((w) => w.inviteId !== inviteId);
      }
    },
    async slugTaken(slug, exceptId) {
      return [...data().invites.values()].some(
        (i) => i.slug === slug && i.id !== exceptId,
      );
    },

    async countRecentSubmissions(kind, ipHash, sinceIso) {
      const since = Date.parse(sinceIso);
      return data().submissions.filter(
        (x) => x.kind === kind && x.ipHash === ipHash && x.at >= since,
      ).length;
    },

    async addRsvp(inviteId, r: NewRsvp) {
      const { ipHash, ...rest } = r;
      data().rsvps.push({
        id: id(), inviteId, ...rest, createdAt: new Date().toISOString(),
      });
      if (ipHash) data().submissions.push({ kind: "rsvps", ipHash, at: Date.now() });
    },
    async listRsvps(inviteId, ownerId) {
      const inv = data().invites.get(inviteId);
      if (!inv || inv.ownerId !== ownerId) return [];
      return data().rsvps.filter((r) => r.inviteId === inviteId).map(clone);
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
      const { ipHash, ...rest } = w;
      data().wishes.push({
        id: id(), inviteId, ...rest, status: "pending", createdAt: new Date().toISOString(),
      });
      if (ipHash) data().submissions.push({ kind: "wishes", ipHash, at: Date.now() });
    },
    async listApprovedWishes(inviteId) {
      return data()
        .wishes.filter((w) => w.inviteId === inviteId && w.status === "approved")
        .map(clone);
    },
    async listAllWishes(inviteId, ownerId) {
      const inv = data().invites.get(inviteId);
      if (!inv || inv.ownerId !== ownerId) return [];
      return data().wishes.filter((w) => w.inviteId === inviteId).map(clone);
    },
    async setWishStatus(wishId, ownerId, status) {
      const w = data().wishes.find((x) => x.id === wishId);
      if (!w) return;
      const inv = data().invites.get(w.inviteId);
      if (inv && inv.ownerId === ownerId) w.status = status;
    },
  };
}
