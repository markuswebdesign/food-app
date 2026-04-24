"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Pencil, Check, X, Loader2, ShoppingBasket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type StapleItem = {
  id: string;
  name: string;
  amount: number | null;
  unit: string | null;
  category: string | null;
};

export function StapleItemsPanel() {
  const [items, setItems] = useState<StapleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [addingToList, setAddingToList] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New item form
  const [newName, setNewName] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newUnit, setNewUnit] = useState("");
  const [newCategory, setNewCategory] = useState("");

  // Edit state
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editUnit, setEditUnit] = useState("");

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    setLoading(true);
    const res = await fetch("/api/staple-items");
    if (res.ok) {
      const data = await res.json();
      setItems(data);
    }
    setLoading(false);
  }

  async function handleAdd() {
    if (!newName.trim()) return;
    setAdding(true);
    setError(null);

    const res = await fetch("/api/staple-items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newName.trim(),
        amount: newAmount ? parseFloat(newAmount) : null,
        unit: newUnit.trim() || null,
        category: newCategory.trim() || null,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Fehler beim Speichern");
    } else {
      setItems((prev) => [...prev, data]);
      setNewName("");
      setNewAmount("");
      setNewUnit("");
      setNewCategory("");
    }
    setAdding(false);
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/staple-items/${id}`, { method: "DELETE" });
    if (res.ok || res.status === 204) {
      setItems((prev) => prev.filter((i) => i.id !== id));
    }
  }

  function startEdit(item: StapleItem) {
    setEditId(item.id);
    setEditName(item.name);
    setEditAmount(item.amount != null ? String(item.amount) : "");
    setEditUnit(item.unit ?? "");
  }

  async function handleSaveEdit() {
    if (!editId) return;
    const res = await fetch(`/api/staple-items/${editId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editName.trim(),
        amount: editAmount ? parseFloat(editAmount) : null,
        unit: editUnit.trim() || null,
      }),
    });
    if (res.ok) {
      const updated = await res.json();
      setItems((prev) => prev.map((i) => (i.id === editId ? updated : i)));
    }
    setEditId(null);
  }

  function handleAddAllToList() {
    if (items.length === 0) return;
    setAddingToList(true);

    try {
      const MANUAL_KEY = "shopping-list-manual";
      const stored = localStorage.getItem(MANUAL_KEY);
      const existing: Array<{ id: string; name: string; amount: string; unit: string }> =
        stored ? JSON.parse(stored) : [];

      const updated = [...existing];
      for (const item of items) {
        const nameKey = item.name.toLowerCase().trim();
        const unitKey = (item.unit ?? "").toLowerCase().trim();
        const match = updated.find(
          (e) => e.name.toLowerCase().trim() === nameKey && (e.unit ?? "").toLowerCase().trim() === unitKey
        );
        if (match && item.amount != null) {
          const existing = parseFloat(match.amount) || 0;
          match.amount = String(existing + item.amount);
        } else if (!match) {
          updated.push({
            id: crypto.randomUUID(),
            name: item.name,
            amount: item.amount != null ? String(item.amount) : "",
            unit: item.unit ?? "",
          });
        }
      }

      localStorage.setItem(MANUAL_KEY, JSON.stringify(updated));
      setAddSuccess(true);
      setTimeout(() => setAddSuccess(false), 2000);
    } catch {
      setError("Fehler beim Hinzufügen zur Einkaufsliste");
    }
    setAddingToList(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Stammprodukte</h2>
          <p className="text-sm text-muted-foreground">Produkte, die du regelmäßig brauchst</p>
        </div>
        {items.length > 0 && (
          <Button
            onClick={handleAddAllToList}
            disabled={addingToList}
            size="sm"
            className="gap-2"
          >
            {addingToList ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : addSuccess ? (
              <Check className="h-4 w-4" />
            ) : (
              <ShoppingBasket className="h-4 w-4" />
            )}
            {addSuccess ? "Hinzugefügt!" : "Alle zur Liste"}
          </Button>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</p>
      )}

      {/* Add form */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            placeholder="Menge"
            value={newAmount}
            onChange={(e) => setNewAmount(e.target.value)}
            className="w-20 shrink-0"
            type="number"
            min="0"
            step="any"
          />
          <Input
            placeholder="Einheit"
            value={newUnit}
            onChange={(e) => setNewUnit(e.target.value)}
            className="w-24 shrink-0"
          />
          <Input
            placeholder="Produkt hinzufügen..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
            className="flex-1"
          />
          <Button onClick={handleAdd} size="icon" disabled={adding || !newName.trim()}>
            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          </Button>
        </div>
        <Input
          placeholder="Kategorie (optional, z.B. Milch, Obst...)"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className="text-sm"
        />
      </div>

      {/* Empty state */}
      {items.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <ShoppingBasket className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p className="font-medium">Noch keine Stammprodukte</p>
          <p className="text-sm mt-1">Füge Produkte hinzu, die du regelmäßig einkaufst.</p>
        </div>
      )}

      {/* Items list */}
      {items.length > 0 && (
        <ul className="divide-y divide-border">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 py-2.5 group">
              {editId === item.id ? (
                <>
                  <Input
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className="w-20 shrink-0 h-8 text-sm"
                    placeholder="Menge"
                    type="number"
                    min="0"
                    step="any"
                  />
                  <Input
                    value={editUnit}
                    onChange={(e) => setEditUnit(e.target.value)}
                    className="w-20 shrink-0 h-8 text-sm"
                    placeholder="Einheit"
                  />
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 h-8 text-sm"
                    onKeyDown={(e) => { if (e.key === "Enter") handleSaveEdit(); }}
                  />
                  <button onClick={handleSaveEdit} className="text-green-600 hover:text-green-700">
                    <Check className="h-4 w-4" />
                  </button>
                  <button onClick={() => setEditId(null)} className="text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm">
                      {item.amount != null && (
                        <span className="font-medium mr-1">
                          {Number.isInteger(item.amount) ? item.amount : item.amount.toFixed(1)}{" "}
                          {item.unit}
                        </span>
                      )}
                      {item.name}
                    </span>
                    {item.category && (
                      <p className="text-xs text-muted-foreground">{item.category}</p>
                    )}
                  </div>
                  <button
                    onClick={() => startEdit(item)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      <p className="text-xs text-muted-foreground text-right">{items.length}/50 Stammprodukte</p>
    </div>
  );
}
