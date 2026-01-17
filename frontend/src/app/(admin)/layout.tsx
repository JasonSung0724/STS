"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { Route } from "next";
import {
    LayoutDashboard,
    Users,
    FileText,
    Tags,
    LogOut,
    Menu,
    X,
    ChevronLeft,
} from "lucide-react";

const navItems = [
    { href: "/admin" as Route, label: "儀表板", icon: LayoutDashboard },
    { href: "/admin/users" as Route, label: "使用者", icon: Users },
    { href: "/admin/articles" as Route, label: "文章審核", icon: FileText },
    { href: "/admin/keywords" as Route, label: "關鍵字管理", icon: Tags },
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
            if (window.innerWidth < 768) {
                setSidebarOpen(false);
            }
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 text-white flex">
            {/* Sidebar */}
            <aside
                className={`
                    fixed md:static inset-y-0 left-0 z-50
                    bg-gray-800 border-r border-gray-700
                    transition-all duration-300 ease-in-out
                    ${sidebarOpen ? "w-64" : "w-0 md:w-20"}
                    ${isMobile && !sidebarOpen ? "-translate-x-full" : "translate-x-0"}
                `}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="h-16 flex items-center justify-between px-4 border-b border-gray-700">
                        {sidebarOpen && (
                            <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                                Admin
                            </span>
                        )}
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            {sidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
                        </button>
                    </div>

                    {/* Nav Items */}
                    <nav className="flex-1 py-4 overflow-y-auto">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`
                                        flex items-center gap-3 px-4 py-3 mx-2 rounded-lg
                                        transition-all duration-200
                                        ${isActive
                                            ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border-l-2 border-cyan-400"
                                            : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                                        }
                                    `}
                                >
                                    <item.icon size={20} />
                                    {sidebarOpen && <span>{item.label}</span>}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Back to Dashboard */}
                    <div className="p-4 border-t border-gray-700">
                        <Link
                            href={"/dashboard" as Route}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700/50 transition-colors"
                        >
                            <LogOut size={20} />
                            {sidebarOpen && <span>返回主頁</span>}
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {isMobile && sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                {/* Top Bar */}
                <header className="h-16 bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 flex items-center px-6 sticky top-0 z-30">
                    {isMobile && (
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 mr-4 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            <Menu size={20} />
                        </button>
                    )}
                    <h1 className="text-lg font-semibold">後台管理</h1>
                </header>

                {/* Page Content */}
                <div className="p-6">{children}</div>
            </main>
        </div>
    );
}
