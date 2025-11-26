"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaHome,
  FaWallet,
  FaUser,
  FaCog,
  FaBitcoin,
  FaChartLine,
  FaBell,
  FaEnvelope,
  FaBars,
  FaChevronRight,
  FaSignOutAlt,
  FaShieldAlt,
  FaCoins,
  FaExchangeAlt,
} from "react-icons/fa";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/firebase";
import { useRouter } from "next/navigation";
import DashboardPage from "@/component/Dash";
import InvestmentPlansPage from "@/component/Invest";
import WalletPage from "@/component/Wallet";
import ProfilePage from "@/component/Profile";
import ChangePasswordPage from "@/component/Change";
import ReferralListPage from "@/component/ReferralListPage";
import NotificationsPage from "@/component/Noti";
import PerformancePage from "@/component/Perform";
import CryptoPurchase from "@/component/CryptoPurchase";
import CryptoRates from "@/component/CryptoRates";
import ContactUs from "@/component/Contact";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        router.push("/login");
      }
    });

    return () => {
      window.removeEventListener("resize", checkMobile);
      unsubscribe();
    };
  }, [router]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const navigationItems = [
    {
      name: "Dashboard",
      icon: <FaHome className="size-5" />,
      category: "main",
    },
    {
      name: "Investment Plans",
      icon: <FaChartLine className="size-5" />,
      category: "invest",
    },
    { name: "Wallet", icon: <FaWallet className="size-5" />, category: "main" },
    {
      name: "Performance",
      icon: <FaCoins className="size-5" />,
      category: "invest",
    },
    {
      name: "Buy Bitcoin",
      icon: <FaBitcoin className="size-5" />,
      category: "crypto",
    },
    {
      name: "Crypto Rates",
      icon: <FaExchangeAlt className="size-5" />,
      category: "crypto",
    },
    {
      name: "Referal List",
      icon: <FaUser className="size-5" />,
      category: "account",
    },
    {
      name: "Profile",
      icon: <FaUser className="size-5" />,
      category: "account",
    },
    {
      name: "Change Password",
      icon: <FaShieldAlt className="size-5" />,
      category: "account",
    },
    {
      name: "Notifications",
      icon: <FaBell className="size-5" />,
      category: "account",
    },
    {
      name: "Contact Us",
      icon: <FaEnvelope className="size-5" />,
      category: "support",
    },
  ];

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const categoryLabels = {
    main: "Main",
    invest: "Investment",
    crypto: "Crypto",
    account: "Account",
    support: "Support",
  };

  const groupedNavigation = navigationItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex overflow-hidden">
      {" "}
      {/* Added overflow-hidden */}
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>
      {/* Sidebar */}
      <motion.div
        className={`fixed inset-y-0 left-0 w-80 bg-white/95 backdrop-blur-xl border-r border-gray-200/60 z-50 lg:static lg:z-0 lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-all duration-300 ease-in-out flex flex-col`} // Added flex flex-col
        initial={{ x: "-100%" }}
        animate={{ x: isSidebarOpen ? 0 : "-100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200/60 flex-shrink-0">
          {" "}
          {/* Added flex-shrink-0 */}
          <div className="flex items-center justify-between">
            <div>
              <div className="mt-2 p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-100">
                <p className="text-sm font-medium text-gray-700">Account No</p>
                <p className="text-lg font-bold text-gray-900">385517921</p>
                <p className="text-xs text-gray-500 mt-1 truncate">
                  Welcome, {user.email}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation - Fixed scrolling area */}
        <div className="flex-1 overflow-y-auto p-4">
          {" "}
          {/* Changed to flex-1 and fixed height */}
          {Object.entries(groupedNavigation).map(([category, items]) => (
            <div key={category} className="mb-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">
                {categoryLabels[category]}
              </h3>
              <div className="space-y-1">
                {items.map((item) => (
                  <motion.button
                    key={item.name}
                    onClick={() => {
                      setActiveTab(item.name);
                      if (isMobile) setIsSidebarOpen(false);
                    }}
                    className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      activeTab === item.name
                        ? "bg-gradient-to-r from-emerald-500 to-emerald-400 text-white shadow-lg shadow-emerald-200"
                        : "text-gray-700 hover:bg-gray-100/80 hover:scale-105"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center">
                      <div
                        className={`p-2 rounded-lg ${
                          activeTab === item.name
                            ? "bg-white/20"
                            : "bg-gray-100"
                        }`}
                      >
                        {item.icon}
                      </div>
                      <span className="ml-3">{item.name}</span>
                    </div>
                    <FaChevronRight
                      className={`size-3 transition-transform ${
                        activeTab === item.name ? "rotate-90" : ""
                      }`}
                    />
                  </motion.button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200/60 flex-shrink-0">
          {" "}
          {/* Added flex-shrink-0 */}
          <button
            onClick={handleSignOut}
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200"
          >
            <FaSignOutAlt className="size-5 mr-3" />
            Sign Out
          </button>
        </div>
      </motion.div>
      {/* Main Content - Fixed scrolling container */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {" "}
        {/* Added overflow-hidden */}
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/60 sticky top-0 z-30 flex-shrink-0">
          {" "}
          {/* Added flex-shrink-0 */}
          <div className="flex items-center justify-between p-4 lg:p-6">
            <div className="flex items-center gap-4">
              <button
                onClick={toggleSidebar}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
              >
                <FaBars className="size-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {activeTab}
                </h1>
                <p className="text-sm text-gray-500 hidden sm:block">
                  Manage your investments and track your performance
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors relative">
                <FaBell className="size-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full flex items-center justify-center text-white font-semibold">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>
        {/* Content Area - Scrollable main content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {" "}
          {/* Changed to overflow-auto */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="h-full"
            >
              {/* Remove backdrop-blur-sm from content container to fix popup issue */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6 min-h-full">
                {activeTab === "Dashboard" && <DashboardPage user={user} />}
                {activeTab === "Investment Plans" && <InvestmentPlansPage />}
                {activeTab === "Wallet" && <WalletPage />}
                {activeTab === "Profile" && <ProfilePage />}
                {activeTab === "Change Password" && <ChangePasswordPage />}
                {activeTab === "Referal List" && <ReferralListPage />}
                {activeTab === "Notifications" && <NotificationsPage />}
                {activeTab === "Performance" && <PerformancePage />}
                {activeTab === "Buy Bitcoin" && <CryptoPurchase />}
                {activeTab === "Crypto Rates" && <CryptoRates />}
                {activeTab === "Contact Us" && <ContactUs />}
              </div>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
