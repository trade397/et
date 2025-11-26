"use client"; // Mark as a Client Component

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { db } from "@/firebase"; // Adjust the import path as needed
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase"; // Import Firebase auth

export default function ProfilePage() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
  });
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
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

  // Fetch user data from Firestore when currentUser changes
  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        try {
          // Fetch user document
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();

            // Set user profile data
            setUser({
              name: userData.firstName + " " + userData.lastName,
              email: userData.email,
              phone: userData.phone || "",
              location: userData.country || "",
              bio: userData.bio || "",
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserData();
  }, [currentUser]); // Re-run when currentUser changes

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    setEditMode(false);
    // Save user data to Firestore (you can implement this later)
    console.log("User data saved:", user);
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
      {/* Profile Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="max-w-7xl mx-auto px-6 py-12"
      >
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-black">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-black">Personal Details</h2>
            <button
              onClick={() => setEditMode(!editMode)}
              className="bg-[#13c636] text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-all"
            >
              {editMode ? "Cancel" : "Edit Profile"}
            </button>
          </div>

          {/* Profile Form */}
          <form>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={user.name}
                  onChange={handleChange}
                  disabled={!editMode}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={user.email}
                  onChange={handleChange}
                  disabled={!editMode}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={user.phone}
                  onChange={handleChange}
                  disabled={!editMode}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>
              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={user.location}
                  onChange={handleChange}
                  disabled={!editMode}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>
            <div className="mt-6">
              <label
                htmlFor="bio"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                value={user.bio}
                onChange={handleChange}
                disabled={!editMode}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            </div>
            {editMode && (
              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleSave}
                  className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-all"
                >
                  Save Changes
                </button>
              </div>
            )}
          </form>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="max-w-7xl mx-auto px-6 py-12"
      ></motion.div>
    </div>
  );
}
