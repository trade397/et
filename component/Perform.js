"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { db, auth } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function PerformancePage() {
  const [timeFrame, setTimeFrame] = useState("weekly");
  const [earningsData, setEarningsData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [goals, setGoals] = useState({ monthlyGoal: 5000, progress: 0 });
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [performanceStats, setPerformanceStats] = useState({
    totalEarnings: 0,
    avgDailyReturn: 0,
    successRate: 0,
    activeInvestments: 0,
    availableBalance: 0,
  });

  // Track authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) return;

      try {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();

          // Get ACTUAL wallet balance from user data, not from transactions
          const availableBalance = userData.walletBalance || 0;

          // Only count COMPLETED transactions, filter out pending ones
          let transactions = (userData.transactionHistory || []).filter(
            (tx) => tx.status === "completed" || tx.status === "confirmed"
          ); // Only completed transactions

          // Sort recent transactions by date
          transactions = transactions.sort(
            (a, b) => new Date(b.date) - new Date(a.date)
          );

          // Set recent activity - only show completed transactions
          setRecentActivity(transactions.slice(0, 5));

          // Aggregate earnings by day of week - only from COMPLETED transactions
          const earningsByDay = {};
          const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

          transactions.forEach((tx) => {
            if (
              tx.amount > 0 &&
              (tx.status === "completed" || tx.status === "confirmed")
            ) {
              const dayName = days[new Date(tx.date).getDay()];
              earningsByDay[dayName] =
                (earningsByDay[dayName] || 0) + tx.amount;
            }
          });

          const formattedEarnings = days.map((day) => ({
            day,
            earnings: earningsByDay[day] || 0,
          }));
          setEarningsData(formattedEarnings);

          // Calculate progress for monthly goals - only from COMPLETED transactions
          const currentMonth = new Date().getMonth();
          const monthlySum = transactions.reduce((sum, tx) => {
            const txDate = new Date(tx.date);
            if (
              tx.amount > 0 &&
              txDate.getMonth() === currentMonth &&
              (tx.status === "completed" || tx.status === "confirmed")
            ) {
              return sum + tx.amount;
            }
            return sum;
          }, 0);

          setGoals({
            monthlyGoal: userData.goals?.monthlyGoal || 5000,
            progress: monthlySum,
          });

          // Calculate performance stats - only from COMPLETED transactions
          const completedTransactions = transactions.filter(
            (tx) => tx.status === "completed" || tx.status === "confirmed"
          );

          const totalEarnings = completedTransactions
            .filter((tx) => tx.amount > 0)
            .reduce((sum, tx) => sum + tx.amount, 0);

          const avgDailyReturn =
            completedTransactions.length > 0
              ? totalEarnings / completedTransactions.length
              : 0;

          const successRate =
            completedTransactions.length > 0
              ? (completedTransactions.filter((tx) => tx.amount > 0).length /
                  completedTransactions.length) *
                100
              : 0;

          setPerformanceStats({
            totalEarnings,
            avgDailyReturn,
            successRate,
            activeInvestments: completedTransactions.filter((tx) =>
              tx.type?.includes("investment")
            ).length,
            availableBalance, // Use actual wallet balance, not transaction sum
          });
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 font-medium">
            Loading performance data...
          </p>
        </div>
      </div>
    );
  }

  // Calculate metrics - only from completed transactions
  const dailyEarnings = earningsData[earningsData.length - 1]?.earnings || 0;
  const weeklyEarnings = earningsData.reduce((s, d) => s + d.earnings, 0);
  const monthlyEarnings = goals.progress;
  const progressPercentage = Math.min(
    100,
    (goals.progress / goals.monthlyGoal) * 100
  );

  const pieData = [
    { name: "Profitable", value: performanceStats.successRate },
    { name: "Non-Profitable", value: 100 - performanceStats.successRate },
  ];

  const COLORS = ["#10b981", "#ef4444"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Performance Analytics
            </h1>
            <p className="text-gray-600 mt-2">
              Real earnings and confirmed investment performance
            </p>
          </div>
          <div className="mt-4 lg:mt-0">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2 border border-gray-200/60">
              <p className="text-sm text-gray-500">Available Balance</p>
              <p className="font-semibold text-emerald-600">
                ${performanceStats.availableBalance.toLocaleString()}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Time Frame Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 py-4"
      >
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 p-4 mb-6">
          <div className="flex flex-wrap gap-2 justify-center">
            {["daily", "weekly", "monthly", "yearly"].map((time) => (
              <motion.button
                key={time}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setTimeFrame(time)}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  timeFrame === time
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md"
                }`}
              >
                {time.charAt(0).toUpperCase() + time.slice(1)}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Performance Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 py-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Available Balance - ACTUAL BALANCE */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 p-6 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">
                Available Balance
              </h3>
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-emerald-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-2">
              ${performanceStats.availableBalance.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">Ready to use</p>
          </div>

          {/* Total EARNED (Not just transactions) */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 p-6 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">
                Total Earned
              </h3>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  ></path>
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-2">
              ${performanceStats.totalEarnings.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">All-time profit</p>
          </div>

          {/* Success Rate */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 p-6 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">
                Success Rate
              </h3>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-2">
              {performanceStats.successRate.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-500">Profitable trades</p>
          </div>

          {/* Completed Investments */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 p-6 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">
                Completed Investments
              </h3>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-2">
              {performanceStats.activeInvestments}
            </p>
            <p className="text-sm text-gray-500">Finished trades</p>
          </div>
        </div>
      </motion.div>

      {/* Charts Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 py-4"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Earnings Chart - Only Completed Transactions */}
          <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                Confirmed Earnings Trend
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                Completed Transactions Only
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={earningsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="earnings"
                    stroke="#10b981"
                    strokeWidth={3}
                    fill="url(#colorEarnings)"
                    fillOpacity={0.3}
                  />
                  <defs>
                    <linearGradient
                      id="colorEarnings"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop
                        offset="95%"
                        stopColor="#10b981"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Performance Pie Chart */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              Trade Performance
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Goals & Activity Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 py-4"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Goals Progress */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                Monthly Goal Progress
              </h2>
              <div className="text-sm text-gray-500">
                {new Date().toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-3">
                  <p className="text-lg font-semibold text-gray-700">
                    Earnings Target
                  </p>
                  <p className="text-lg font-bold text-emerald-600">
                    ${goals.progress.toLocaleString()} / $
                    {goals.monthlyGoal.toLocaleString()}
                  </p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-4 rounded-full relative"
                  >
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-white rounded-full"></div>
                  </motion.div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {progressPercentage.toFixed(1)}% completed • $
                  {(goals.monthlyGoal - goals.progress).toLocaleString()} to go
                </p>
              </div>

              {/* Quick Stats - Only Completed Earnings */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    ${dailyEarnings}
                  </p>
                  <p className="text-xs text-gray-500">Today</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    ${weeklyEarnings}
                  </p>
                  <p className="text-xs text-gray-500">This Week</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    ${monthlyEarnings}
                  </p>
                  <p className="text-xs text-gray-500">This Month</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity - Only Completed Transactions */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                Completed Activity
              </h2>
              <button className="text-sm text-emerald-600 font-medium hover:text-emerald-700">
                View All
              </button>
            </div>

            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-xl border border-gray-200/60 hover:shadow-md transition-all bg-white/50"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          activity.amount > 0
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {activity.amount > 0 ? (
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            ></path>
                          </svg>
                        ) : (
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                            ></path>
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 capitalize">
                          {activity.type}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(activity.date).toLocaleDateString()}
                          {activity.status && (
                            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              Completed
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <p
                      className={`text-lg font-bold ${
                        activity.amount > 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {activity.amount > 0 ? "+" : ""}$
                      {activity.amount.toLocaleString()}
                    </p>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      ></path>
                    </svg>
                  </div>
                  <p className="text-gray-500">No completed transactions yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
