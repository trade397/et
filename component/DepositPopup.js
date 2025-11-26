"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { db } from "@/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import QRCode from "react-qr-code";

export default function DepositPopup({ onClose, currentUser, showToast }) {
  const [amount, setAmount] = useState("");
  const [btcAmount, setBtcAmount] = useState(0);
  const [btcPrice, setBtcPrice] = useState(0);
  const [isPaid, setIsPaid] = useState(false);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [processing, setProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);
  const [userWalletAddress, setUserWalletAddress] = useState("");
  const [walletBalance, setWalletBalance] = useState(0);

  // Default Bitcoin wallet address
  const defaultBtcWallet = "bc1quk28pa8ujaghsthl6lhwdfemfvv00prhyw6lt0";

  // Fetch user data from Firestore when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser || !currentUser.uid) {
        setError("User authentication required. Please log in again.");
        showToast("Authentication error", "error");
        setLoading(false);
        return;
      }

      try {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setWalletBalance(userData.walletBalance || 0);
          setUserWalletAddress(userData.walletAddress || "");
        } else {
          setError("User data not found. Please try again.");
          showToast("User data not found", "error");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to load user data. Please try again.");
        showToast("Failed to load user data", "error");
      } finally {
        setLoading(false); // Always set loading to false when done
      }
    };

    fetchUserData();
  }, [currentUser, showToast]);

  // Safely determine which wallet to use
  const hasValidWallet =
    userWalletAddress &&
    typeof userWalletAddress === "string" &&
    userWalletAddress.trim() !== "";
  const btcWallet = hasValidWallet ? userWalletAddress : defaultBtcWallet;

  // Ensure we always have a valid value for QRCode
  const qrCodeValue = btcWallet || defaultBtcWallet;

  // Fetch current Bitcoin price
  useEffect(() => {
    const fetchBtcPrice = async () => {
      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
        );
        const data = await response.json();
        setBtcPrice(data.bitcoin.usd);
      } catch (error) {
        console.error("Error fetching BTC price:", error);
        // Fallback price
        setBtcPrice(50000);
      }
    };

    fetchBtcPrice();
  }, []);

  // Calculate BTC amount when USD amount changes
  useEffect(() => {
    if (amount && btcPrice) {
      const btcValue = parseFloat(amount) / btcPrice;
      setBtcAmount(btcValue);
    } else {
      setBtcAmount(0);
    }
  }, [amount, btcPrice]);

  const handleAmountChange = (e) => {
    const value = e.target.value;
    // Allow only numbers and decimal point
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const copyToClipboard = (text) => {
    if (!text) {
      showToast("No wallet address available to copy", "error");
      return;
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast("Wallet address copied to clipboard!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleMarkAsPaid = async () => {
    if (!currentUser || !currentUser.uid) {
      showToast("User authentication required. Please log in again.", "error");
      return;
    }

    if (!amount || amount <= 0) {
      showToast("Please enter a valid amount", "error");
      return;
    }

    setProcessing(true);
    try {
      // Create a deposit transaction record
      const depositData = {
        type: "deposit",
        amount: parseFloat(amount),
        btcAmount,
        btcWallet: qrCodeValue,
        status: "pending",
        createdAt: serverTimestamp(),
        userId: currentUser.uid,
        userWalletUsed: hasValidWallet,
      };

      // Add to transactions collection
      const transactionsRef = collection(db, "transactions");
      const transactionDoc = await addDoc(transactionsRef, depositData);

      // Also add to user's transaction history
      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, {
        transactionHistory: arrayUnion({
          id: transactionDoc.id,
          ...depositData,
          createdAt: new Date().toISOString(),
        }),
      });

      setIsPaid(true);
      showToast(
        "Deposit request submitted! It will be processed once confirmed.",
        "success"
      );

      // Close popup after 3 seconds
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (error) {
      console.error("Error creating deposit:", error);
      showToast("Failed to process deposit. Please try again.", "error");
    } finally {
      setProcessing(false);
    }
  };

  // If there's an error with user data, show error message
  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Authentication Error
          </h2>
          <p className="text-red-500 mb-6">{error}</p>
          <button
            onClick={onClose}
            className="bg-gray-200 text-gray-700 py-2 px-6 rounded-lg hover:bg-gray-300 transition-all font-medium w-full"
          >
            Close
          </button>
        </motion.div>
      </div>
    );
  }

  // Show loading spinner while data is being fetched
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 flex flex-col items-center justify-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">Loading wallet information...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4"
      >
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Deposit with Bitcoin
        </h2>

        {!isPaid ? (
          <>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount to Deposit (USD)
              </label>
              <input
                type="text"
                value={amount}
                onChange={handleAmountChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter amount"
              />
              {btcAmount > 0 && (
                <p className="text-sm text-gray-600 mt-2">
                  ≈ {btcAmount.toFixed(8)} BTC
                </p>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Send Bitcoin to this address:
              </p>

              {/* Show notification if using default wallet */}
              {/* {!hasValidWallet && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-3">
                  <p className="text-yellow-800 text-sm">
                    Using platform wallet. To use your personal wallet, set your Bitcoin address in your profile.
                  </p>
                </div>
              )} */}

              {/* Show success message if using personal wallet */}
              {hasValidWallet && (
                <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-3">
                  <p className="text-green-800 text-sm">
                    Using your personal Bitcoin wallet address.
                  </p>
                </div>
              )}

              <div className="flex justify-center mb-3">
                <QRCode value={qrCodeValue} size={128} />
              </div>

              <div className="flex items-center justify-between bg-white p-2 rounded border">
                <p className="text-xs font-mono truncate mr-2">{qrCodeValue}</p>
                <button
                  onClick={() => copyToClipboard(qrCodeValue)}
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>

              <div className="mt-4 text-xs text-gray-500">
                <p className="font-medium mb-1">Important:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Send only Bitcoin (BTC) to this address</li>
                  <li>Network: Bitcoin Mainnet</li>
                  <li>Do not send other cryptocurrencies</li>
                  <li>Transaction may take 10-30 minutes to confirm</li>
                  {/* {!hasValidWallet && (
                    <li className="text-yellow-600 font-medium">
                      You're using the platform wallet. Set your personal wallet in profile settings.
                    </li>
                  )} */}
                </ul>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={onClose}
                className="bg-gray-200 text-gray-700 py-2 px-6 rounded-lg hover:bg-gray-300 transition-all font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkAsPaid}
                disabled={!amount || processing || !currentUser}
                className="bg-indigo-600 text-white py-2 px-6 rounded-lg hover:bg-indigo-700 transition-all font-medium disabled:opacity-50"
              >
                {processing ? "Processing..." : "I Have Paid"}
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="text-green-500 text-5xl mb-4">✓</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Deposit Request Received
            </h3>
            <p className="text-gray-600 mb-4">
              Your deposit of ${amount} is being processed. Funds will be added
              to your account once the transaction is confirmed on the
              blockchain.
            </p>
            <button
              onClick={onClose}
              className="bg-indigo-600 text-white py-2 px-6 rounded-lg hover:bg-indigo-700 transition-all font-medium"
            >
              Close
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
