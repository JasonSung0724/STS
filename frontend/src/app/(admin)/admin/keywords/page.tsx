"use client";

import { useState, useEffect } from "react";
import {
    Plus,
    Trash2,
    Edit2,
    Check,
    X,
    Search,
    ToggleLeft,
    ToggleRight,
    Save,
} from "lucide-react";

interface Keyword {
    id: string;
    category: string;
    keyword: string;
    keyword_zh: string | null;
    description: string | null;
    is_active: boolean;
    weight: number;
    created_at: string;
    updated_at: string;
}

interface KeywordListResponse {
    items: Keyword[];
    total: number;
    categories: string[];
}

const CATEGORY_LABELS: Record<string, string> = {
    startup: "創業相關",
    business: "商業策略與經營",
    marketing: "行銷概念",
    kpi: "KPI 與績效管理",
    cost: "成本與效率",
    finance: "金融投資",
    industry: "產業分析",
    tech: "AI 與科技趨勢",
    taiwan: "台灣相關",
    management: "管理與領導",
    ecommerce: "電商與消費",
};

const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
    value,
    label,
}));

export default function KeywordManagementPage() {
    const [keywords, setKeywords] = useState<Keyword[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // New keyword form
    const [showAddForm, setShowAddForm] = useState(false);
    const [newKeyword, setNewKeyword] = useState({
        category: "startup",
        keyword: "",
        keyword_zh: "",
        description: "",
        weight: 1.0,
    });

    // Edit state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editData, setEditData] = useState<Partial<Keyword>>({});

    useEffect(() => {
        fetchKeywords();
    }, [selectedCategory]);

    const fetchKeywords = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            let url = "/api/v1/keywords?active_only=false";
            if (selectedCategory) {
                url += `&category=${selectedCategory}`;
            }
            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Failed to fetch");
            const data: KeywordListResponse = await res.json();
            setKeywords(data.items);
            setCategories(data.categories);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("/api/v1/keywords", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newKeyword),
            });
            if (!res.ok) throw new Error("Failed to add");
            setShowAddForm(false);
            setNewKeyword({
                category: "startup",
                keyword: "",
                keyword_zh: "",
                description: "",
                weight: 1.0,
            });
            fetchKeywords();
        } catch (err) {
            console.error(err);
        }
    };

    const handleToggle = async (id: string) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/v1/keywords/${id}/toggle`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Failed to toggle");
            const updated = await res.json();
            setKeywords((prev) =>
                prev.map((k) => (k.id === id ? updated : k))
            );
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("確定要刪除這個關鍵字嗎？")) return;
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/v1/keywords/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Failed to delete");
            setKeywords((prev) => prev.filter((k) => k.id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdate = async (id: string) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/v1/keywords/${id}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(editData),
            });
            if (!res.ok) throw new Error("Failed to update");
            const updated = await res.json();
            setKeywords((prev) =>
                prev.map((k) => (k.id === id ? updated : k))
            );
            setEditingId(null);
            setEditData({});
        } catch (err) {
            console.error(err);
        }
    };

    const filteredKeywords = keywords.filter(
        (k) =>
            k.keyword.toLowerCase().includes(search.toLowerCase()) ||
            (k.keyword_zh && k.keyword_zh.includes(search))
    );

    const groupedKeywords = filteredKeywords.reduce((acc, k) => {
        if (!acc[k.category]) acc[k.category] = [];
        acc[k.category].push(k);
        return acc;
    }, {} as Record<string, Keyword[]>);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">關鍵字管理</h2>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors"
                >
                    <Plus size={18} />
                    新增關鍵字
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-64">
                    <div className="relative">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            size={18}
                        />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="搜尋關鍵字..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500"
                        />
                    </div>
                </div>
                <select
                    value={selectedCategory || ""}
                    onChange={(e) => setSelectedCategory(e.target.value || null)}
                    className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500"
                >
                    <option value="">所有分類</option>
                    {CATEGORY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(groupedKeywords).map(([category, items]) => (
                        <div
                            key={category}
                            className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden"
                        >
                            <div className="px-4 py-3 bg-gray-700/50 border-b border-gray-700">
                                <h3 className="font-semibold">
                                    {CATEGORY_LABELS[category] || category}
                                    <span className="ml-2 text-sm text-gray-400">
                                        ({items.length})
                                    </span>
                                </h3>
                            </div>
                            <div className="divide-y divide-gray-700">
                                {items.map((kw) => (
                                    <div
                                        key={kw.id}
                                        className={`p-4 flex items-center gap-4 ${!kw.is_active ? "opacity-50" : ""
                                            }`}
                                    >
                                        {editingId === kw.id ? (
                                            <>
                                                <input
                                                    type="text"
                                                    value={editData.keyword ?? kw.keyword}
                                                    onChange={(e) =>
                                                        setEditData({ ...editData, keyword: e.target.value })
                                                    }
                                                    className="flex-1 px-3 py-1 bg-gray-700 border border-gray-600 rounded"
                                                />
                                                <input
                                                    type="text"
                                                    value={editData.keyword_zh ?? kw.keyword_zh ?? ""}
                                                    onChange={(e) =>
                                                        setEditData({ ...editData, keyword_zh: e.target.value })
                                                    }
                                                    placeholder="中文"
                                                    className="w-32 px-3 py-1 bg-gray-700 border border-gray-600 rounded"
                                                />
                                                <input
                                                    type="number"
                                                    value={editData.weight ?? kw.weight}
                                                    onChange={(e) =>
                                                        setEditData({ ...editData, weight: parseFloat(e.target.value) })
                                                    }
                                                    step="0.1"
                                                    min="0.1"
                                                    max="3"
                                                    className="w-20 px-3 py-1 bg-gray-700 border border-gray-600 rounded"
                                                />
                                                <button
                                                    onClick={() => handleUpdate(kw.id)}
                                                    className="p-2 text-green-400 hover:bg-green-500/20 rounded"
                                                >
                                                    <Check size={18} />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setEditingId(null);
                                                        setEditData({});
                                                    }}
                                                    className="p-2 text-gray-400 hover:bg-gray-700 rounded"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <div className="flex-1">
                                                    <span className="font-medium">{kw.keyword}</span>
                                                    {kw.keyword_zh && (
                                                        <span className="ml-2 text-gray-400">
                                                            ({kw.keyword_zh})
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-sm text-gray-400">
                                                    權重: {kw.weight.toFixed(1)}
                                                </span>
                                                <button
                                                    onClick={() => handleToggle(kw.id)}
                                                    className={`p-2 rounded ${kw.is_active
                                                            ? "text-green-400 hover:bg-green-500/20"
                                                            : "text-gray-400 hover:bg-gray-700"
                                                        }`}
                                                >
                                                    {kw.is_active ? (
                                                        <ToggleRight size={18} />
                                                    ) : (
                                                        <ToggleLeft size={18} />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setEditingId(kw.id);
                                                        setEditData({});
                                                    }}
                                                    className="p-2 text-gray-400 hover:bg-gray-700 rounded"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(kw.id)}
                                                    className="p-2 text-red-400 hover:bg-red-500/20 rounded"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Form Modal */}
            {showAddForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 w-full max-w-md">
                        <h3 className="text-xl font-semibold mb-4">新增關鍵字</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">
                                    分類
                                </label>
                                <select
                                    value={newKeyword.category}
                                    onChange={(e) =>
                                        setNewKeyword({ ...newKeyword, category: e.target.value })
                                    }
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-cyan-500"
                                >
                                    {CATEGORY_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">
                                    關鍵字 (英文)
                                </label>
                                <input
                                    type="text"
                                    value={newKeyword.keyword}
                                    onChange={(e) =>
                                        setNewKeyword({ ...newKeyword, keyword: e.target.value })
                                    }
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-cyan-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">
                                    中文對應 (選填)
                                </label>
                                <input
                                    type="text"
                                    value={newKeyword.keyword_zh}
                                    onChange={(e) =>
                                        setNewKeyword({ ...newKeyword, keyword_zh: e.target.value })
                                    }
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-cyan-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">
                                    權重 (0.1 - 3.0)
                                </label>
                                <input
                                    type="number"
                                    value={newKeyword.weight}
                                    onChange={(e) =>
                                        setNewKeyword({
                                            ...newKeyword,
                                            weight: parseFloat(e.target.value),
                                        })
                                    }
                                    step="0.1"
                                    min="0.1"
                                    max="3"
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-cyan-500"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowAddForm(false)}
                                className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                            >
                                取消
                            </button>
                            <button
                                onClick={handleAdd}
                                disabled={!newKeyword.keyword}
                                className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors disabled:opacity-50"
                            >
                                新增
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
