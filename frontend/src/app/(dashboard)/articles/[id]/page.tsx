"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import {
    ArrowLeft,
    ExternalLink,
    Clock,
    User,
    Tag,
    RefreshCw,
    Loader2,
    CheckCircle,
    AlertCircle,
    Hourglass,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { articlesApi, ArticleDetail } from "@/lib/api";

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

const STATUS_CONFIG: Record<
    string,
    { icon: React.ReactNode; label: string; color: string }
> = {
    pending: {
        icon: <Hourglass className="h-4 w-4" />,
        label: "待處理",
        color: "text-yellow-400 bg-yellow-400/10",
    },
    processing: {
        icon: <Loader2 className="h-4 w-4 animate-spin" />,
        label: "處理中",
        color: "text-blue-400 bg-blue-400/10",
    },
    completed: {
        icon: <CheckCircle className="h-4 w-4" />,
        label: "已完成",
        color: "text-green-400 bg-green-400/10",
    },
    failed: {
        icon: <AlertCircle className="h-4 w-4" />,
        label: "失敗",
        color: "text-red-400 bg-red-400/10",
    },
};

export default function ArticleDetailPage() {
    const params = useParams();
    const router = useRouter();
    const articleId = params.id as string;

    const [article, setArticle] = useState<ArticleDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [rewriting, setRewriting] = useState(false);
    const [showOriginal, setShowOriginal] = useState(false);

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                setLoading(true);
                const data = await articlesApi.get(articleId);
                setArticle(data);
            } catch (error) {
                console.error("Failed to fetch article:", error);
                router.push("/articles" as Route);
            } finally {
                setLoading(false);
            }
        };

        if (articleId) {
            fetchArticle();
        }
    }, [articleId, router]);

    const handleRewrite = async () => {
        if (!article) return;
        try {
            setRewriting(true);
            const updated = await articlesApi.rewrite(articleId);
            setArticle(updated);
        } catch (error) {
            console.error("Failed to rewrite article:", error);
        } finally {
            setRewriting(false);
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "—";
        return new Date(dateString).toLocaleDateString("zh-TW", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
            </div>
        );
    }

    if (!article) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <p className="text-white/60">文章不存在</p>
            </div>
        );
    }

    const statusConfig = STATUS_CONFIG[article.status] || STATUS_CONFIG.pending;

    return (
        <div className="min-h-screen bg-slate-950 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Back Button */}
                <Link
                    href={"/articles" as Route}
                    className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    返回文章列表
                </Link>

                {/* Article Card */}
                <article className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                    {/* Header */}
                    <div className="p-6 border-b border-white/10">
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                            {/* Platform Badge */}
                            <span
                                className={cn(
                                    "px-3 py-1 text-sm font-medium rounded-full text-white bg-gradient-to-r",
                                    PLATFORM_COLORS[article.source_platform] ||
                                    PLATFORM_COLORS.custom
                                )}
                            >
                                {PLATFORM_LABELS[article.source_platform] ||
                                    article.source_platform}
                            </span>

                            {/* Status Badge */}
                            <span
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-1 text-sm font-medium rounded-full",
                                    statusConfig.color
                                )}
                            >
                                {statusConfig.icon}
                                {statusConfig.label}
                            </span>
                        </div>

                        {/* Title */}
                        <h1 className="text-2xl font-bold text-white mb-4">
                            {article.title}
                        </h1>

                        {/* Meta */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-white/50">
                            {article.author && (
                                <span className="flex items-center gap-1.5">
                                    <User className="h-4 w-4" />
                                    {article.author}
                                </span>
                            )}
                            <span className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4" />
                                {formatDate(article.published_at || article.created_at)}
                            </span>
                            <a
                                href={article.original_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 transition-colors"
                            >
                                <ExternalLink className="h-4 w-4" />
                                原文連結
                            </a>
                        </div>

                        {/* Tags */}
                        {article.tags && article.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-4">
                                {article.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="flex items-center gap-1 px-2 py-1 text-xs bg-white/5 text-white/60 rounded-lg"
                                    >
                                        <Tag className="h-3 w-3" />
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {/* Summary */}
                        {article.summary && (
                            <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl p-4 mb-6">
                                <h2 className="text-sm font-medium text-cyan-400 mb-2">
                                    摘要
                                </h2>
                                <p className="text-white/80">{article.summary}</p>
                            </div>
                        )}

                        {/* Content Toggle */}
                        <div className="flex items-center gap-4 mb-4">
                            <button
                                onClick={() => setShowOriginal(false)}
                                className={cn(
                                    "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                                    !showOriginal
                                        ? "bg-cyan-500/20 text-cyan-400"
                                        : "text-white/50 hover:text-white"
                                )}
                            >
                                改寫內容
                            </button>
                            <button
                                onClick={() => setShowOriginal(true)}
                                className={cn(
                                    "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                                    showOriginal
                                        ? "bg-cyan-500/20 text-cyan-400"
                                        : "text-white/50 hover:text-white"
                                )}
                            >
                                原始內容
                            </button>

                            {article.status !== "completed" && (
                                <button
                                    onClick={handleRewrite}
                                    disabled={rewriting}
                                    className={cn(
                                        "ml-auto flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                                        "bg-gradient-to-r from-cyan-500 to-blue-500 text-white",
                                        "hover:from-cyan-400 hover:to-blue-400",
                                        "disabled:opacity-50 disabled:cursor-not-allowed"
                                    )}
                                >
                                    <RefreshCw
                                        className={cn("h-4 w-4", rewriting && "animate-spin")}
                                    />
                                    {rewriting ? "改寫中..." : "AI 改寫"}
                                </button>
                            )}
                        </div>

                        {/* Content Body */}
                        <div className="prose prose-invert prose-cyan max-w-none">
                            {showOriginal ? (
                                <div className="whitespace-pre-wrap text-white/70 text-sm leading-relaxed">
                                    {article.original_content}
                                </div>
                            ) : article.rewritten_content ? (
                                <div className="whitespace-pre-wrap text-white/90 leading-relaxed">
                                    {article.rewritten_content}
                                </div>
                            ) : (
                                <div className="text-center py-10 text-white/50">
                                    <p>尚未改寫，請點擊「AI 改寫」按鈕</p>
                                </div>
                            )}
                        </div>
                    </div>
                </article>
            </div>
        </div>
    );
}
