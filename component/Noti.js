"use client"; // Mark as a Client Component

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { db } from "@/firebase"; // Adjust the import path as needed
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase"; // Import Firebase auth

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]); // Real notifications
  const [loading, setLoading] = useState(true); // Loading state
  const [currentUser, setCurrentUser] = useState(null); // Track the current user

  // Track authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user); // Set the current user
      } else {
        setCurrentUser(null); // No user is signed in
      }
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  // Fetch notifications from Firestore when currentUser changes
  useEffect(() => {
    const fetchNotifications = async () => {
      if (currentUser) {
        try {
          // Fetch user document
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();

            // Set notifications
            if (userData.notifications) {
              setNotifications(userData.notifications);
            }
          }
        } catch (error) {
          console.error("Error fetching notifications:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchNotifications();
  }, [currentUser]); // Re-run when currentUser changes

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
    // You can also update Firestore to mark the notification as read
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Notifications List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 py-12"
      >
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8">
          <div className="space-y-4">
            {notifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * notification.id }}
                className={`p-4 rounded-lg border ${
                  notification.read ? "border-gray-200" : "border-indigo-300"
                } hover:shadow-md transition-shadow`}
              >
                <div className="flex justify-between items-start">
                  {/* Notification Details */}
                  <div className="flex-1">
                    <p className="text-lg font-semibold text-gray-900">
                      {notification.type}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(notification.date).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Mark as Read Button */}
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="ml-4 px-3 py-1 text-sm font-semibold bg-[#13c636] bg-indigo-50 rounded-full hover:bg-indigo-100 transition-all"
                    >
                      Mark as Read
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
