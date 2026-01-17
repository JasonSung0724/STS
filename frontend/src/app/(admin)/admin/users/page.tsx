"use client";

import { useState, useEffect } from "react";
import {
    Search,
    ChevronLeft,
    ChevronRight,
    Mail,
    Calendar,
    User as UserIcon,
} from "lucide-react";

interface User {
    id: string;
    email: string | null;
    name: string | null;
    created_at: string;
    last_login_at: string | null;
    is_active: boolean;
}

interface UserListResponse {
    items: User[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [searchDebounce, setSearchDebounce] = useState("");

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchDebounce(search);
            setPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        fetchUsers();
    }, [page, searchDebounce]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            let url = `/api/v1/admin/users?page=${page}&page_size=10`;
            if (searchDebounce) {
                url += `&search=${encodeURIComponent(searchDebounce)}`;
            }
            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Failed to fetch");
            const data: UserListResponse = await res.json();
            setUsers(data.items);
            setTotal(data.total);
            setTotalPages(data.total_pages);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("zh-TW", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">使用者管理</h2>
                    <p className="text-gray-400 mt-1">共 {total} 位使用者</p>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="搜尋 Email 或名稱..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500"
                />
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
                </div>
            ) : (
                <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-700/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">
                                    使用者
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">
                                    註冊日期
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">
                                    狀態
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {users.map((user) => (
                                <tr
                                    key={user.id}
                                    className="hover:bg-gray-700/30 transition-colors"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                                                <UserIcon size={18} />
                                            </div>
                                            <div>
                                                <div className="font-medium">
                                                    {user.name || "未設定名稱"}
                                                </div>
                                                <div className="text-sm text-gray-400">
                                                    ID: {user.id.slice(0, 8)}...
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-gray-300">
                                            <Mail size={14} className="text-gray-500" />
                                            {user.email || "-"}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-gray-300">
                                            <Calendar size={14} className="text-gray-500" />
                                            {formatDate(user.created_at)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs ${user.is_active
                                                    ? "bg-green-500/20 text-green-400"
                                                    : "bg-red-500/20 text-red-400"
                                                }`}
                                        >
                                            {user.is_active ? "活躍" : "停用"}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-700">
                            <div className="text-sm text-gray-400">
                                顯示 {(page - 1) * 10 + 1} - {Math.min(page * 10, total)} / {total}
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="p-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <span className="text-sm">
                                    {page} / {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="p-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
