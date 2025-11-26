"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function InvestmentPlansPage() {
  const plans = [
    {
      name: "Presidential",
      minAmount: 15000,
      maxAmount: 29999,
      returnPercentage: 35,
      duration: 7,
      color: "from-blue-600 to-indigo-700",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
          ></path>
        </svg>
      ),
    },
    {
      name: "Platinum",
      minAmount: 30000,
      maxAmount: 100000,
      returnPercentage: 50,
      duration: 10,
      color: "from-purple-600 to-pink-600",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
          ></path>
        </svg>
      ),
    },
  ];

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleInvestClick = (plan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPlan(null);
    setInvestmentAmount("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-cyan-50 text-gray-800">
      {/* Hero Section */}
      <div className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-95"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-black opacity-10"></div>

        <div className="relative max-w-7xl mx-auto px-6 text-center z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            Investment Plans
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-indigo-100 max-w-2xl mx-auto"
          >
            Choose a plan that suits your investment goals and start earning
            today!
          </motion.p>
        </div>
      </div>

      {/* Investment Plans */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="max-w-7xl mx-auto px-6 py-12"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all"
            >
              {/* Plan Header */}
              <div
                className={`bg-gradient-to-r ${plan.color} py-6 px-8 text-white`}
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">{plan.name}</h2>
                  <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                    {plan.icon}
                  </div>
                </div>
                <p className="mt-2 opacity-90">Premium Investment Plan</p>
              </div>

              {/* Plan Details */}
              <div className="p-8">
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      ${plan.minAmount.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">Minimum</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      ${plan.maxAmount.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">Maximum</div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 mb-6 text-center">
                  <div className="text-3xl font-bold text-gray-900">
                    {plan.returnPercentage}%
                  </div>
                  <div className="text-sm text-gray-500">
                    Return after {plan.duration} day(s)
                  </div>
                </div>

                <div className="mb-6">
                  <label
                    htmlFor={`amount-${plan.name}`}
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Enter Investment Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500">
                      $
                    </span>
                    <input
                      type="number"
                      id={`amount-${plan.name}`}
                      value={investmentAmount}
                      onChange={(e) => setInvestmentAmount(e.target.value)}
                      min={plan.minAmount}
                      max={plan.maxAmount}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      placeholder={`${plan.minAmount} - ${plan.maxAmount}`}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Enter amount between ${plan.minAmount.toLocaleString()} and
                    ${plan.maxAmount.toLocaleString()}
                  </p>
                </div>

                <button
                  onClick={() => handleInvestClick(plan)}
                  className="w-full bg-gradient-to-r from-[#13c636] to-teal-500 text-white py-3 px-6 rounded-xl font-medium hover:from-teal-500 hover:to-teal-600 transition-all shadow-md hover:shadow-lg"
                >
                  Invest Now
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Features Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-white py-12"
      >
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Why Invest With Us?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  ></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                High Returns
              </h3>
              <p className="text-gray-600">
                Earn up to 50% returns on your investment in just 10 days.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  ></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Secure & Safe
              </h3>
              <p className="text-gray-600">
                Your investments are protected with advanced security measures.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  ></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                24/7 Support
              </h3>
              <p className="text-gray-600">
                Our customer care team is always available to assist you.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Disclaimer Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="bg-gray-100 py-8"
      >
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm text-gray-600 max-w-3xl mx-auto">
            Disclaimer: Investment in our plans gives you daily returns on your
            investment until the expiry date. The more you invest, the more you
            earn. So invest with us today! All investments are subject to market
            risks. Please read all scheme related documents carefully before
            investing.
          </p>
        </div>
      </motion.div>

      {/* Popup Modal with Dark Dropdown Background */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-md w-full border border-gray-800"
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-white">
                Chat with Customer Care
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>

            <p className="text-gray-300 mb-6">
              To proceed with your investment in the{" "}
              <span className="font-semibold text-indigo-400">
                {selectedPlan?.name}
              </span>{" "}
              plan, please chat with our customer care service for assistance
              and to better understand the process.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <button
                onClick={closeModal}
                className="bg-gray-700 text-white py-3 px-6 rounded-xl hover:bg-gray-600 transition-all font-medium"
              >
                Close
              </button>
              <a
                href="https://wa.me/1234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 text-white py-3 px-6 rounded-xl hover:bg-green-700 transition-all font-medium flex items-center justify-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.864 3.488"></path>
                </svg>
                Chat on WhatsApp
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
