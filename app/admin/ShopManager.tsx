"use client";

import { useState, useEffect, useCallback } from "react";
import ImagePicker from "./ImagePicker";

interface Product {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  price: number; // cents
  dimensions: string;
  paperType: string;
  displayRatio: string;
  published: boolean;
  sortOrder: number | null;
}

const RATIO_OPTIONS = [
  { value: "4:3", label: "Landscape (4:3)" },
  { value: "3:4", label: "Portrait (3:4)" },
  { value: "1:1", label: "Square (1:1)" },
];

interface Order {
  id: string;
  name: string;
  email: string;
  status: string;
  createdAt: string;
  product: { title: string; dimensions: string; price: number } | null;
}

const BLANK = {
  title: "",
  description: "",
  imageUrl: "",
  priceDollars: "",
  dimensions: "",
  paperType: "",
  displayRatio: "4:3",
  published: true,
};

const dollars = (cents: number) =>
  `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

export default function ShopManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ ...BLANK });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, oRes] = await Promise.all([
        fetch("/api/shop?all=1"),
        fetch("/api/shop/order"),
      ]);
      if (pRes.ok) setProducts(await pRes.json());
      if (oRes.ok) setOrders(await oRes.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function resetForm() {
    setForm({ ...BLANK });
    setEditingId(null);
  }

  function startEdit(p: Product) {
    setEditingId(p.id);
    setForm({
      title: p.title,
      description: p.description || "",
      imageUrl: p.imageUrl,
      priceDollars: (p.price / 100).toString(),
      dimensions: p.dimensions,
      paperType: p.paperType,
      displayRatio: p.displayRatio || "4:3",
      published: p.published,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function save() {
    if (!form.title.trim() || !form.imageUrl.trim() || !form.dimensions.trim() || !form.paperType.trim()) {
      alert("Image, title, dimensions and paper type are required.");
      return;
    }
    const cents = Math.round(parseFloat(form.priceDollars || "0") * 100);
    if (!Number.isFinite(cents) || cents < 0) {
      alert("Enter a valid price.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        imageUrl: form.imageUrl,
        price: cents,
        dimensions: form.dimensions,
        paperType: form.paperType,
        displayRatio: form.displayRatio,
        published: form.published,
      };
      const res = await fetch(editingId ? `/api/shop/${editingId}` : "/api/shop", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        resetForm();
        await load();
      } else {
        const d = await res.json().catch(() => ({}));
        alert(d.error || "Failed to save.");
      }
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this print listing?")) return;
    const res = await fetch(`/api/shop/${id}`, { method: "DELETE" });
    if (res.ok) {
      if (editingId === id) resetForm();
      setProducts((ps) => ps.filter((p) => p.id !== id));
    }
  }

  async function togglePublished(p: Product) {
    const res = await fetch(`/api/shop/${p.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !p.published }),
    });
    if (res.ok) setProducts((ps) => ps.map((x) => (x.id === p.id ? { ...x, published: !p.published } : x)));
  }

  async function move(index: number, dir: -1 | 1) {
    const next = index + dir;
    if (next < 0 || next >= products.length) return;
    const reordered = [...products];
    [reordered[index], reordered[next]] = [reordered[next], reordered[index]];
    setProducts(reordered);
    await fetch("/api/shop/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: reordered.map((p) => p.id) }),
    });
  }

  const fmtDate = (s: string) =>
    new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="space-y-8">
      {showPicker && (
        <ImagePicker
          onSelect={(url) => {
            setForm((f) => ({ ...f, imageUrl: url }));
            setShowPicker(false);
          }}
          onClose={() => setShowPicker(false)}
        />
      )}

      {/* Create / edit form */}
      <div className="card card-white p-10">
        <h2 className="font-heading text-xl font-bold mb-2">
          {editingId ? "Edit print" : "New print listing"}
        </h2>
        <p className="font-body text-[#6b6b6b] mb-6">
          Pick any image in your system (or paste a URL), then set the price, size, paper and a short description.
        </p>

        <div className="grid gap-6 md:grid-cols-[200px_1fr]">
          {/* Image chooser */}
          <div>
            <label className="font-body text-sm text-gray-600 block mb-2">Image</label>
            <button
              type="button"
              onClick={() => setShowPicker(true)}
              className="flex aspect-[4/5] w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-gray-300 bg-gray-50 hover:border-[#547890]"
            >
              {form.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.imageUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="font-body text-sm text-gray-400">+ Choose image</span>
              )}
            </button>
            {form.imageUrl && (
              <button
                type="button"
                onClick={() => setShowPicker(true)}
                className="mt-2 font-body text-xs text-gray-500 hover:text-gray-800"
              >
                Change image
              </button>
            )}
          </div>

          {/* Fields */}
          <div className="space-y-4">
            <div>
              <label className="font-body text-sm text-gray-600 block mb-2">Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Autumn Light, Rock Creek"
                className="w-full rounded-xl border border-gray-300 px-3 py-2 font-body focus:border-gray-400 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="font-body text-sm text-gray-600 block mb-2">Price (USD)</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.priceDollars}
                  onChange={(e) => setForm((f) => ({ ...f, priceDollars: e.target.value }))}
                  placeholder="450"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 font-body focus:border-gray-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="font-body text-sm text-gray-600 block mb-2">Dimensions</label>
                <input
                  value={form.dimensions}
                  onChange={(e) => setForm((f) => ({ ...f, dimensions: e.target.value }))}
                  placeholder={'16 × 20 in'}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 font-body focus:border-gray-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="font-body text-sm text-gray-600 block mb-2">Paper type</label>
                <input
                  value={form.paperType}
                  onChange={(e) => setForm((f) => ({ ...f, paperType: e.target.value }))}
                  placeholder="Archival Matte"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 font-body focus:border-gray-400 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="font-body text-sm text-gray-600 block mb-2">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
                placeholder="A brief note about the piece — where/when it was made, the print process, edition…"
                className="w-full rounded-xl border border-gray-300 px-3 py-2 font-body focus:border-gray-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-body text-sm text-gray-600 block mb-2">
                Display shape on grid
              </label>
              <div className="flex flex-wrap gap-2">
                {RATIO_OPTIONS.map((opt) => {
                  const on = form.displayRatio === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, displayRatio: opt.value }))}
                      className="rounded-lg border px-3 py-1.5 font-body text-sm transition-colors"
                      style={{
                        background: on ? "#547890" : "transparent",
                        borderColor: on ? "#547890" : "#d1d5db",
                        color: on ? "#fff" : "#374151",
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
              <p className="font-body text-xs text-gray-400 mt-1">
                The frame shape; the image is matted inside it (never cropped).
              </p>
            </div>

            <label className="flex items-center gap-2 font-body text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
              />
              Published (visible on the shop)
            </label>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={save}
                disabled={saving}
                className="rounded-xl bg-[#1a1a1a] px-6 py-3 font-body text-white hover:bg-[#333] disabled:opacity-50"
              >
                {saving ? "Saving…" : editingId ? "Save changes" : "Add print"}
              </button>
              {editingId && (
                <button
                  onClick={resetForm}
                  className="font-body text-sm text-gray-500 hover:text-gray-800"
                >
                  Cancel edit
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Product list */}
      <div className="card card-white p-10">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-heading text-xl font-bold">Prints ({products.length})</h2>
          <button onClick={load} className="font-body text-sm text-gray-500 hover:text-gray-800">
            Refresh
          </button>
        </div>

        {loading ? (
          <p className="font-body text-gray-400">Loading…</p>
        ) : products.length === 0 ? (
          <p className="font-body text-gray-400">No prints yet. Add one above.</p>
        ) : (
          <div className="space-y-3">
            {products.map((p, i) => (
              <div
                key={p.id}
                className="flex items-center gap-4 rounded-xl border border-gray-200 p-3"
                style={{ opacity: p.published ? 1 : 0.6 }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.imageUrl} alt="" className="h-16 w-16 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-bold text-gray-900">{p.title}</span>
                    {!p.published && (
                      <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[0.65rem] uppercase tracking-wide text-gray-600">
                        Hidden
                      </span>
                    )}
                  </div>
                  <p className="font-body text-sm text-gray-500">
                    {dollars(p.price)} · {p.dimensions} · {p.paperType}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    className="rounded-lg px-2 py-1 font-body text-gray-500 hover:bg-gray-100 disabled:opacity-30"
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => move(i, 1)}
                    disabled={i === products.length - 1}
                    className="rounded-lg px-2 py-1 font-body text-gray-500 hover:bg-gray-100 disabled:opacity-30"
                    title="Move down"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => togglePublished(p)}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 font-body text-xs hover:bg-gray-50"
                  >
                    {p.published ? "Hide" : "Show"}
                  </button>
                  <button
                    onClick={() => startEdit(p)}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 font-body text-xs hover:bg-gray-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => remove(p.id)}
                    className="rounded-lg px-3 py-1.5 font-body text-xs text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Customer records */}
      <div className="card card-white p-10">
        <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-heading text-xl font-bold">Activity ({orders.length})</h2>
          <a
            href="/api/shop/customers"
            className="rounded-lg px-4 py-2 font-body text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#547890" }}
          >
            Download customer CSV
          </a>
        </div>
        <p className="font-body text-[#6b6b6b] mb-6">
          Checkout starts and legacy inquiries below. The CSV is the ledger of everyone who{" "}
          <em>completed</em> a print purchase (name + email), pulled from the{" "}
          <a href="https://joshuaisaiah.art/payment" className="underline" target="_blank" rel="noreferrer">
            payment dashboard
          </a>
          .
        </p>
        {orders.length === 0 ? (
          <p className="font-body text-gray-400">No activity yet.</p>
        ) : (
          <div className="space-y-2">
            {orders.map((o) => {
              const started = o.status === "checkout_started";
              return (
                <div
                  key={o.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gray-200 px-4 py-3"
                >
                  <div>
                    {o.name ? (
                      <>
                        <span className="font-heading font-bold text-gray-900">{o.name}</span>
                        {o.email && (
                          <span className="ml-2 font-body text-sm text-gray-500">
                            <a href={`mailto:${o.email}`} className="underline">
                              {o.email}
                            </a>
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="font-body text-sm font-semibold text-[#547890]">
                        {started ? "Checkout started" : "Inquiry"}
                      </span>
                    )}
                  </div>
                  <div className="font-body text-sm text-gray-500">
                    {o.product?.title || "—"} · {fmtDate(o.createdAt)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
