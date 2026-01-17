"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type { Route } from "next";
import {
    RefreshCw,
    ExternalLink,
    Clock,
    User,
    Tag,
    Filter,
    ChevronLeft,
    ChevronRight,
    Loader2,
    CheckCircle,
    AlertCircle,
    Hourglass,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { articlesApi, ArticleListItem, ArticleListResponse } from "@/lib/api";

const PLATFORM_COLORS: Record<string, string> = {
    medium: "from-green-500 to-green-600",
    devto: "from-purple-500 to-purple-600",
    hackernews: "from-orange-500 to-orange-600",
    x: "from-gray-700 to-gray-800",
    reddit: "from-red-500 to-red-600",
    taiwan_news: "from-cyan-500 to-blue-500",
    custom: "from-blue-500 to-blue-600",
};

const PLATFORM_LABELS: Record<string, string> = {
    medium: "Medium",
    devto: "Dev.to",
    hackernews: "Hacker News",
    x: "X (Twitter)",
    reddit: "Reddit",
    taiwan_news: "台灣新聞",
    custom: "Custom",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
    pending: <Hourglass className="h-4 w-4 text-yellow-400" />,
    processing: <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />,
    completed: <CheckCircle className="h-4 w-4 text-green-400" />,
    failed: <AlertCircle className="h-4 w-4 text-red-400" />,
};

export default function ArticlesPage() {
    const t = useTranslations();
    const [articles, setArticles] = useState<ArticleListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [selectedPlatform, setSelectedPlatform] = useState<string>("");
    const [selectedStatus, setSelectedStatus] = useState<string>("");

    const fetchArticles = async () => {
        try {
            setLoading(true);
            const params: Record<string, unknown> = { page, page_size: 12 };
            if (selectedPlatform) params.platform = selectedPlatform;
            if (selectedStatus) params.status = selectedStatus;

            const response: ArticleListResponse = await articlesApi.list(params);
            setArticles(response.items);
            setTotalPages(response.total_pages);
            setTotal(response.total);
        } catch (error) {
            console.error("Failed to fetch articles:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArticles();
    }, [page, selectedPlatform, selectedStatus]);

    const handleSync = async () => {
        try {
            setSyncing(true);
            await articlesApi.sync({ limit_per_platform: 5 });
            await fetchArticles();
        } catch (error) {
            console.error("Failed to sync articles:", error);
        } finally {
            setSyncing(false);
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "—";
        return new Date(dateString).toLocaleDateString("zh-TW", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    return (
        <div className="min-h-screen bg-slate-950 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-white">
                            {t("articles.title") || "文章"}
                        </h1>
                        <p className="text-white/60 mt-1">
                            {t("articles.subtitle") || `共 ${total} 篇文章`}
                        </p>
                    </div>

                    <button
                        onClick={handleSync}
                        disabled={syncing}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all",
                            "bg-gradient-to-r from-cyan-500 to-blue-500 text-white",
                            "hover:from-cyan-400 hover:to-blue-400",
                            "disabled:opacity-50 disabled:cursor-not-allowed"
                        )}
                    >
                        <RefreshCw
                            className={cn("h-4 w-4", syncing && "animate-spin")}
                        />
                        {syncing ? "同步中..." : "同步文章"}
                    </button>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 mb-6">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-white/40" />
                        <select
                            value={selectedPlatform}
                            onChange={(e) => {
                                setSelectedPlatform(e.target.value);
                                setPage(1);
                            }}
                            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                        >
                            <option value="">所有平台</option>
                            {Object.entries(PLATFORM_LABELS).map(([key, label]) => (
                                <option key={key} value={key}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <select
                        value={selectedStatus}
                        onChange={(e) => {
                            setSelectedStatus(e.target.value);
                            setPage(1);
                        }}
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                    >
                        <option value="">所有狀態</option>
                        <option value="completed">已完成</option>
                        <option value="pending">待處理</option>
                        <option value="processing">處理中</option>
                        <option value="failed">失敗</option>
                    </select>
                </div>

                {/* Articles Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
                    </div>
                ) : articles.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-white/60 mb-4">尚無文章</p>
                        <button
                            onClick={handleSync}
                            className="text-cyan-400 hover:text-cyan-300"
                        >
                            點擊同步文章
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {articles.map((article) => (
                            <Link
                                key={article.id}
                                href={`/articles/${article.id}` as Route}
                                className="group block bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-cyan-500/50 hover:bg-white/10 transition-all duration-300"
                            >
                                {/* Platform Badge */}
                                <div className="flex items-center justify-between mb-3">
                                    <span
                                        className={cn(
                                            "px-2 py-1 text-xs font-medium rounded-full text-white bg-gradient-to-r",
                                            PLATFORM_COLORS[article.source_platform] ||
                                            PLATFORM_COLORS.custom
                                        )}
                                    >
                                        {PLATFORM_LABELS[article.source_platform] ||
                                            article.source_platform}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        {STATUS_ICONS[article.status]}
                                    </div>
                                </div>

                                {/* Title */}
                                <h3 className="text-lg font-semibold text-white group-hover:text-cyan-400 transition-colors line-clamp-2 mb-3">
                                    {article.title}
                                </h3>

                                {/* Summary */}
                                {article.summary && (
                                    <p className="text-sm text-white/60 line-clamp-3 mb-4">
                                        {article.summary}
                                    </p>
                                )}

                                {/* Meta */}
                                <div className="flex flex-wrap items-center gap-3 text-xs text-white/40">
                                    {article.author && (
                                        <span className="flex items-center gap-1">
                                            <User className="h-3 w-3" />
                                            {article.author}
                                        </span>
                                    )}
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {formatDate(article.published_at || article.created_at)}
                                    </span>
                                </div>

                                {/* Tags */}
                                {article.tags && article.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-3">
                                        {article.tags.slice(0, 3).map((tag) => (
                                            <span
                                                key={tag}
                                                className="flex items-center gap-1 px-2 py-0.5 text-xs bg-white/5 text-white/50 rounded"
                                            >
                                                <Tag className="h-2.5 w-2.5" />
                                                {tag}
                                            </span>
                                        ))}
                                        {article.tags.length > 3 && (
                                            <span className="text-xs text-white/30">
                                                +{article.tags.length - 3}
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* External Link Icon */}
                                <div className="flex justify-end mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ExternalLink className="h-4 w-4 text-cyan-400" />
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page <= 1}
                            className="p-2 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>

                        <span className="text-white/60 text-sm px-4">
                            {page} / {totalPages}
                        </span>

                        <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page >= totalPages}
                            className="p-2 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
