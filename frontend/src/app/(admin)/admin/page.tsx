"use client";

import { useState, useEffect } from "react";
import {
    Users,
    FileText,
    CheckCircle,
    XCircle,
    Clock,
    TrendingUp,
    AlertCircle,
} from "lucide-react";

interface DashboardStats {
    users: {
        total_users: number;
        active_today: number;
        active_this_week: number;
        new_this_week: number;
    };
    articles: {
        total_articles: number;
        pending_review: number;
        approved: number;
        completed: number;
        skipped: number;
        failed: number;
    };
    platforms: { platform: string; count: number }[];
    recent_articles: number;
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

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("/api/v1/admin/stats", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!res.ok) throw new Error("Failed to fetch stats");
            const data = await res.json();
            setStats(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "載入失敗");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400">
                {error}
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">儀表板總覽</h2>

            {/* User Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="總使用者"
                    value={stats.users.total_users}
                    icon={<Users className="text-cyan-400" />}
                    gradient="from-cyan-500/20 to-blue-500/20"
                />
                <StatCard
                    title="本週新增"
                    value={stats.users.new_this_week}
                    icon={<TrendingUp className="text-green-400" />}
                    gradient="from-green-500/20 to-emerald-500/20"
                />
                <StatCard
                    title="文章總數"
                    value={stats.articles.total_articles}
                    icon={<FileText className="text-purple-400" />}
                    gradient="from-purple-500/20 to-pink-500/20"
                />
                <StatCard
                    title="24 小時內"
                    value={stats.recent_articles}
                    icon={<Clock className="text-orange-400" />}
                    gradient="from-orange-500/20 to-yellow-500/20"
                />
            </div>

            {/* Article Stats */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                <h3 className="text-lg font-semibold mb-4">文章狀態</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <StatusCard
                        label="待審核"
                        value={stats.articles.pending_review}
                        color="text-yellow-400"
                        icon={<AlertCircle size={16} />}
                    />
                    <StatusCard
                        label="已核准"
                        value={stats.articles.approved}
                        color="text-green-400"
                        icon={<CheckCircle size={16} />}
                    />
                    <StatusCard
                        label="已完成"
                        value={stats.articles.completed}
                        color="text-cyan-400"
                        icon={<FileText size={16} />}
                    />
                    <StatusCard
                        label="已跳過"
                        value={stats.articles.skipped}
                        color="text-gray-400"
                        icon={<XCircle size={16} />}
                    />
                    <StatusCard
                        label="失敗"
                        value={stats.articles.failed}
                        color="text-red-400"
                        icon={<XCircle size={16} />}
                    />
                </div>
            </div>

            {/* Platform Distribution */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                <h3 className="text-lg font-semibold mb-4">平台分佈</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {stats.platforms.map((p) => (
                        <div
                            key={p.platform}
                            className="bg-gray-700/50 rounded-lg p-4 text-center"
                        >
                            <div className="text-2xl font-bold text-white">
                                {p.count}
                            </div>
                            <div className="text-sm text-gray-400">
                                {PLATFORM_LABELS[p.platform] || p.platform}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function StatCard({
    title,
    value,
    icon,
    gradient,
}: {
    title: string;
    value: number;
    icon: React.ReactNode;
    gradient: string;
}) {
    return (
        <div
            className={`bg-gradient-to-br ${gradient} rounded-xl border border-gray-700 p-6`}
        >
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-sm text-gray-400">{title}</div>
                    <div className="text-3xl font-bold mt-1">{value}</div>
                </div>
                <div className="p-3 bg-gray-800/50 rounded-lg">{icon}</div>
            </div>
        </div>
    );
}

function StatusCard({
    label,
    value,
    color,
    icon,
}: {
    label: string;
    value: number;
    color: string;
    icon: React.ReactNode;
}) {
    return (
        <div className="bg-gray-700/30 rounded-lg p-4">
            <div className={`flex items-center gap-2 ${color} mb-1`}>
                {icon}
                <span className="text-sm">{label}</span>
            </div>
            <div className="text-2xl font-bold">{value}</div>
        </div>
    );
}
