"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    CheckCircle,
    XCircle,
    ExternalLink,
    Eye,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
} from "lucide-react";

interface Article {
    id: string;
    title: string;
    original_url: string;
    source_platform: string;
    author: string | null;
    rewritten_content: string | null;
    summary: string | null;
    status: string;
    analysis_score: number | null;
    created_at: string;
}

interface ArticleListResponse {
    items: Article[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
}

const PLATFORM_LABELS: Record<string, string> = {
    medium: "Medium",
    devto: "Dev.to",
    hackernews: "Hacker News",
    x: "X (Twitter)",
    reddit: "Reddit",
    taiwan_news: "台灣新聞",
    custom: "Custom",
};

export default function ArticleReviewPage() {
    const router = useRouter();
    const [articles, setArticles] = useState<Article[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState("");
    const [showRejectModal, setShowRejectModal] = useState(false);

    useEffect(() => {
        fetchArticles();
    }, [page]);

    const fetchArticles = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(
                `/api/v1/articles/pending-review?page=${page}&page_size=10`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            if (!res.ok) throw new Error("Failed to fetch");
            const data: ArticleListResponse = await res.json();
            setArticles(data.items);
            setTotal(data.total);
            setTotalPages(data.total_pages);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (articleId: string) => {
        setActionLoading(articleId);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/v1/articles/${articleId}/approve`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Failed to approve");
            // Remove from list
            setArticles((prev) => prev.filter((a) => a.id !== articleId));
            setTotal((prev) => prev - 1);
            setSelectedArticle(null);
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async () => {
        if (!selectedArticle || !rejectReason) return;
        setActionLoading(selectedArticle.id);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(
                `/api/v1/articles/${selectedArticle.id}/reject?reason=${encodeURIComponent(rejectReason)}`,
                {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            if (!res.ok) throw new Error("Failed to reject");
            // Remove from list
            setArticles((prev) => prev.filter((a) => a.id !== selectedArticle.id));
            setTotal((prev) => prev - 1);
            setSelectedArticle(null);
            setShowRejectModal(false);
            setRejectReason("");
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">文章審核</h2>
                    <p className="text-gray-400 mt-1">共 {total} 篇待審核文章</p>
                </div>
                <button
                    onClick={fetchArticles}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                >
                    <RefreshCw size={16} />
                    重新載入
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
                </div>
            ) : articles.length === 0 ? (
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-12 text-center">
                    <CheckCircle className="mx-auto text-green-400 mb-4" size={48} />
                    <h3 className="text-xl font-semibold">沒有待審核的文章</h3>
                    <p className="text-gray-400 mt-2">所有文章都已審核完成</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Article List */}
                    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                        <div className="divide-y divide-gray-700">
                            {articles.map((article) => (
                                <div
                                    key={article.id}
                                    onClick={() => setSelectedArticle(article)}
                                    className={`p-4 cursor-pointer transition-colors ${selectedArticle?.id === article.id
                                            ? "bg-cyan-500/10 border-l-2 border-cyan-500"
                                            : "hover:bg-gray-700/50"
                                        }`}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium truncate">
                                                {article.title}
                                            </h4>
                                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-400">
                                                <span className="px-2 py-0.5 bg-gray-700 rounded text-xs">
                                                    {PLATFORM_LABELS[article.source_platform] ||
                                                        article.source_platform}
                                                </span>
                                                {article.analysis_score && (
                                                    <span>分數: {article.analysis_score.toFixed(0)}</span>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleApprove(article.id);
                                            }}
                                            disabled={actionLoading === article.id}
                                            className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors disabled:opacity-50"
                                        >
                                            <CheckCircle size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 p-4 border-t border-gray-700">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="p-2 rounded-lg hover:bg-gray-700 disabled:opacity-50"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <span className="text-sm text-gray-400">
                                    {page} / {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="p-2 rounded-lg hover:bg-gray-700 disabled:opacity-50"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Article Preview */}
                    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                        {selectedArticle ? (
                            <div className="flex flex-col h-full">
                                <div className="p-4 border-b border-gray-700">
                                    <h3 className="font-semibold">{selectedArticle.title}</h3>
                                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                                        <a
                                            href={selectedArticle.original_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 hover:text-cyan-400"
                                        >
                                            <ExternalLink size={14} />
                                            原文連結
                                        </a>
                                        {selectedArticle.author && (
                                            <span>作者: {selectedArticle.author}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex-1 overflow-auto p-4">
                                    {selectedArticle.summary && (
                                        <div className="mb-4 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                                            <div className="text-sm text-cyan-400 mb-1">摘要</div>
                                            <p className="text-sm">{selectedArticle.summary}</p>
                                        </div>
                                    )}
                                    <div className="prose prose-invert prose-sm max-w-none">
                                        {selectedArticle.rewritten_content ? (
                                            <div
                                                dangerouslySetInnerHTML={{
                                                    __html: selectedArticle.rewritten_content.replace(
                                                        /\n/g,
                                                        "<br>"
                                                    ),
                                                }}
                                            />
                                        ) : (
                                            <p className="text-gray-400">尚無改寫內容</p>
                                        )}
                                    </div>
                                </div>

                                <div className="p-4 border-t border-gray-700 flex gap-3">
                                    <button
                                        onClick={() => handleApprove(selectedArticle.id)}
                                        disabled={actionLoading === selectedArticle.id}
                                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-600 hover:bg-green-500 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        <CheckCircle size={18} />
                                        核准發布
                                    </button>
                                    <button
                                        onClick={() => setShowRejectModal(true)}
                                        disabled={actionLoading === selectedArticle.id}
                                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-600 hover:bg-red-500 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        <XCircle size={18} />
                                        拒絕
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-64 text-gray-400">
                                <div className="text-center">
                                    <Eye className="mx-auto mb-2" size={32} />
                                    <p>選擇文章以預覽</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 w-full max-w-md">
                        <h3 className="text-xl font-semibold mb-4">拒絕文章</h3>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="請輸入拒絕原因..."
                            className="w-full h-32 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-cyan-500 resize-none"
                        />
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setRejectReason("");
                                }}
                                className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                            >
                                取消
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={!rejectReason || actionLoading !== null}
                                className="flex-1 py-2 bg-red-600 hover:bg-red-500 rounded-lg transition-colors disabled:opacity-50"
                            >
                                確認拒絕
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
