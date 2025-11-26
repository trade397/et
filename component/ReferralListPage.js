"use client"; // Mark as a Client Component

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getAuth } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/firebase"; // Adjust the import path as needed

export default function ReferralListPage() {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReferrals = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        setError("No user is signed in.");
        setLoading(false);
        return;
      }

      console.log("Current User UID:", user.uid); // Debugging

      try {
        // Fetch user document by UID (assuming document ID is the user's UID)
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);

        console.log("User Document:", userDoc); // Debugging

        if (!userDoc.exists()) {
          console.log("No document found for user:", user.uid); // Debugging
          setError("User document not found.");
          setLoading(false);
          return;
        }

        // Extract referrals from the user document
        const userData = userDoc.data();
        const referralsData = userData.referrals || []; // Default to an empty array if no referrals exist

        // Format the referrals data
        const formattedReferrals = referralsData.map((referral) => ({
          id: referral.userId, // Use userId as the unique ID
          email: referral.email,
          date: new Date(referral.date).toLocaleDateString(), // Format the date
          status: "Active", // Default status (you can adjust this based on your logic)
        }));

        setReferrals(formattedReferrals);
      } catch (error) {
        console.error("Error fetching referrals:", error);
        setError("Failed to fetch referrals.");
      } finally {
        setLoading(false);
      }
    };

    fetchReferrals();
  }, []);

  // Generate referral link
  const auth = getAuth();
  const user = auth.currentUser;
  const referralLink = user
    ? `https://xxxxxx.netlify.app/register?ref=${user.uid}`
    : "";

  return (
    <div className="min-h-screen text-black">
      {/* Referral Link Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 py-12"
      >
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Your Referral Link
          </h2>
          <div className="flex items-center space-x-4">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
            <button
              onClick={() => navigator.clipboard.writeText(referralLink)}
              className="px-4 py-2 bg-[#13c636] text-white rounded-lg hover:bg-emerald-400 transition-all"
            >
              Copy Link
            </button>
          </div>
        </div>
      </motion.div>

      {/* Referral List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 py-12"
      >
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Your Referrals
          </h2>
          {loading ? (
            <p className="text-center text-gray-500">Loading referrals...</p>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : referrals.length === 0 ? (
            <p className="text-center text-gray-500">No referrals found.</p>
          ) : (
            <div className="space-y-4">
              {referrals.map((referral) => (
                <motion.div
                  key={referral.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * referral.id }}
                  className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    {/* Referral Details */}
                    <div className="flex-1">
                      <p className="text-lg font-semibold text-gray-900">
                        {referral.email}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Referred on:{" "}
                        <span className="font-medium">{referral.date}</span>
                      </p>
                    </div>

                    {/* Status Badge */}
                    <div className="mt-4 sm:mt-0 sm:ml-4">
                      <span
                        className={`px-3 py-1 text-sm font-semibold rounded-full ${
                          referral.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : referral.status === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {referral.status}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
