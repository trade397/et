"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { db } from "@/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  arrayUnion,
} from "firebase/firestore";
import { auth } from "@/firebase";

export default function TransferPopup({ onClose, currentUser, showToast }) {
  const [recipientEmail, setRecipientEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTransfer = async () => {
    if (!recipientEmail || !amount) {
      setError("Please fill in all fields.");
      return;
    }

    if (isNaN(amount) || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    // Check if the transfer amount exceeds $500
    if (parseFloat(amount) > 500) {
      setError("Transfer limit exceeded. Maximum allowed is $500.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Fetch sender's data
      const senderDocRef = doc(db, "users", currentUser.uid);
      const senderDocSnap = await getDoc(senderDocRef);

      if (!senderDocSnap.exists()) {
        setError("Sender data not found.");
        return;
      }

      const senderData = senderDocSnap.data();
      const senderBalance = senderData.walletBalance || 0;

      // Check if sender has sufficient balance
      if (senderBalance < parseFloat(amount)) {
        setError("Insufficient balance.");
        return;
      }

      // Fetch recipient's data
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", recipientEmail));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError("Recipient not found.");
        return;
      }

      const recipientDoc = querySnapshot.docs[0];
      const recipientData = recipientDoc.data();
      const recipientBalance = recipientData.walletBalance || 0;

      // Update sender's balance
      await updateDoc(senderDocRef, {
        walletBalance: senderBalance - parseFloat(amount),
        transactions: arrayUnion({
          type: "transfer",
          amount: -parseFloat(amount),
          date: new Date().toISOString(),
          recipientEmail: recipientEmail,
        }),
      });

      // Update recipient's balance
      await updateDoc(recipientDoc.ref, {
        walletBalance: recipientBalance + parseFloat(amount),
        transactions: arrayUnion({
          type: "transfer",
          amount: parseFloat(amount),
          date: new Date().toISOString(),
          senderEmail: currentUser.email,
        }),
      });

      showToast(
        `Successfully transferred $${amount} to ${recipientEmail}.`,
        "success"
      );
      onClose();
    } catch (error) {
      console.error("Error transferring funds:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full"
      >
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Transfer Funds
        </h2>
        <p className="text-gray-600 mb-6">
          Enter the recipient's email and the amount you want to transfer.
        </p>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Recipient's Email"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
        </div>

        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-700 py-2 px-6 rounded-lg hover:bg-gray-400 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleTransfer}
            disabled={loading}
            className="bg-[#13c636] text-white py-2 px-6 rounded-lg hover:bg-indigo-700 transition-all disabled:opacity-50"
          >
            {loading ? "Transferring..." : "Transfer"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
