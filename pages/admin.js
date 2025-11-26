"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "@/firebase";

// Helper function for safe number formatting
const formatCurrency = (value) => {
  const num = parseFloat(value);
  return isNaN(num) ? "0.00" : num.toFixed(2);
};

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [amount, setAmount] = useState("");
  const [actionType, setActionType] = useState("deposit");
  const [loading, setLoading] = useState(false);
  const [showPasswordPopup, setShowPasswordPopup] = useState(true);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showBankAccounts, setShowBankAccounts] = useState(false);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalBalance: 0,
    verifiedUsers: 0,
    recentSignups: 0,
  });

  // Fetch users from Firestore (sorted by signup date)
  useEffect(() => {
    const fetchUsers = async () => {
      if (showPasswordPopup) return;

      setLoading(true);
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const usersData = [];
        querySnapshot.forEach((doc) => {
          const userData = doc.data();
          usersData.push({
            id: doc.id,
            ...userData,
            walletBalance: parseFloat(userData.walletBalance) || 0,
          });
        });
        setUsers(usersData);
        setFilteredUsers(usersData);

        // Calculate analytics
        const totalBalance = usersData.reduce(
          (sum, user) => sum + (user.walletBalance || 0),
          0
        );
        const verifiedUsers = usersData.filter((user) => user.verified).length;
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const recentSignups = usersData.filter(
          (user) => new Date(user.createdAt) > weekAgo
        ).length;

        setAnalytics({
          totalUsers: usersData.length,
          totalBalance,
          verifiedUsers,
          recentSignups,
        });
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [showPasswordPopup]);

  // Filter users based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(
        (user) =>
          user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.lastName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  // Fetch bank accounts
  const fetchBankAccounts = async () => {
    setLoading(true);
    try {
      const bankAccountsRef = collection(db, "bankAccounts");
      const querySnapshot = await getDocs(bankAccountsRef);
      const bankAccountsData = [];
      querySnapshot.forEach((doc) => {
        bankAccountsData.push({ id: doc.id, ...doc.data() });
      });
      setBankAccounts(bankAccountsData);
      setShowBankAccounts(true);
    } catch (error) {
      console.error("Error fetching bank accounts:", error);
      alert("Error fetching bank accounts");
    } finally {
      setLoading(false);
    }
  };

  // Handle password submission
  const handlePasswordSubmit = () => {
    if (password === "admin135") {
      setShowPasswordPopup(false);
      setPasswordError("");
    } else {
      setPasswordError("Incorrect password. Please try again.");
    }
  };

  // Handle user action (deposit, withdrawal, etc.)
  const handleUserAction = async () => {
    if (!selectedUser || !amount) return;

    try {
      const userRef = doc(db, "users", selectedUser.id);
      const numericAmount = parseFloat(amount);

      if (isNaN(numericAmount) || numericAmount <= 0) {
        alert("Please enter a valid amount greater than 0");
        return;
      }

      let updatedBalance = parseFloat(selectedUser.walletBalance) || 0;

      switch (actionType) {
        case "withdrawal":
          if (numericAmount > updatedBalance) {
            alert("Insufficient balance for withdrawal");
            return;
          }
          updatedBalance -= numericAmount;
          break;
        case "deposit":
          updatedBalance += numericAmount;
          break;
        case "referral":
          updatedBalance += numericAmount;
          break;
        case "roi":
          updatedBalance += numericAmount;
          break;
        default:
          alert("Invalid action type");
          return;
      }

      // Update wallet balance
      await updateDoc(userRef, {
        walletBalance: updatedBalance,
      });

      // Add transaction to history with proper numeric values
      const transaction = {
        type: actionType,
        amount: numericAmount,
        date: new Date().toISOString(),
        adminInitiated: true,
        previousBalance: parseFloat(selectedUser.walletBalance) || 0,
        newBalance: updatedBalance,
      };

      await updateDoc(userRef, {
        transactionHistory: [
          ...(selectedUser.transactionHistory || []),
          transaction,
        ],
      });

      // Update local state
      const updatedUsers = users.map((user) =>
        user.id === selectedUser.id
          ? {
              ...user,
              walletBalance: updatedBalance,
              transactionHistory: [
                ...(user.transactionHistory || []),
                transaction,
              ],
            }
          : user
      );

      setUsers(updatedUsers);
      setSelectedUser({
        ...selectedUser,
        walletBalance: updatedBalance,
        transactionHistory: [
          ...(selectedUser.transactionHistory || []),
          transaction,
        ],
      });
      setAmount("");
      alert(
        `Successfully processed ${actionType} of $${numericAmount.toFixed(2)}`
      );
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Error processing transaction");
    }
  };

  // Update user field
  const handleUpdateUserField = async (field, value) => {
    if (!selectedUser) return;

    try {
      const userRef = doc(db, "users", selectedUser.id);

      // Convert to number if it's a balance field
      const finalValue =
        field === "walletBalance" ? parseFloat(value) || 0 : value;

      await updateDoc(userRef, { [field]: finalValue });

      // Update local state
      const updatedUsers = users.map((user) =>
        user.id === selectedUser.id ? { ...user, [field]: finalValue } : user
      );

      setUsers(updatedUsers);
      setSelectedUser({ ...selectedUser, [field]: finalValue });
      setEditingField(null);
      alert("User data updated successfully");
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Error updating user data");
    }
  };

  // Delete user
  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteDoc(doc(db, "users", userId));
        setUsers(users.filter((user) => user.id !== userId));
        setFilteredUsers(filteredUsers.filter((user) => user.id !== userId));
        if (selectedUser && selectedUser.id === userId) {
          setSelectedUser(null);
          setShowUserDetail(false);
        }
        alert("User deleted successfully.");
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  // Verify user
  const handleVerifyUser = async (userId) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { verified: true });

      // Update local state
      const updatedUsers = users.map((user) =>
        user.id === userId ? { ...user, verified: true } : user
      );

      setUsers(updatedUsers);
      setFilteredUsers(
        filteredUsers.map((user) =>
          user.id === userId ? { ...user, verified: true } : user
        )
      );
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser({ ...selectedUser, verified: true });
      }
      alert("User verified successfully.");
    } catch (error) {
      console.error("Error verifying user:", error);
    }
  };

  // Add this state variable
  const [chatScript, setChatScript] = useState("");
  const [showChatScriptPopup, setShowChatScriptPopup] = useState(false);

  // Add this function to handle saving the chat script
  const handleSaveChatScript = async () => {
    try {
      // Use setDoc instead of updateDoc - it will create or update the document
      const configRef = doc(db, "config", "chatScript");
      await setDoc(configRef, {
        script: chatScript,
        updatedAt: new Date().toISOString(),
      });
      alert("Chat script updated successfully!");
      setShowChatScriptPopup(false);
    } catch (error) {
      console.error("Error saving chat script:", error);
      alert("Error saving chat script");
    }
  };

  // Add this useEffect to load the existing script on component mount
  useEffect(() => {
    const loadChatScript = async () => {
      try {
        const configRef = doc(db, "config", "chatScript");
        const configDoc = await getDoc(configRef);
        if (configDoc.exists()) {
          setChatScript(configDoc.data().script);
        } else {
          // Set default script if none exists
          const defaultScript = `var _smartsupp = _smartsupp || {};
_smartsupp.key = '0f7ed07b0e7734e5176ca64f81cbb21f083e549b';
window.smartsupp||(function(d) {
  var s,c,o=smartsupp=function(){ o._.push(arguments)};o._=[];
  s=d.getElementsByTagName('script')[0];c=d.createElement('script');
  c.type='text/javascript';c.charset='utf-8';c.async=true;
  c.src='https://www.smartsuppchat.com/loader.js?';s.parentNode.insertBefore(c,s);
})(document);`;
          setChatScript(defaultScript);
        }
      } catch (error) {
        console.error("Error loading chat script:", error);
      }
    };

    if (!showPasswordPopup) {
      loadChatScript();
    }
  }, [showPasswordPopup]);

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      {/* Password Popup */}
      {showPasswordPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Admin Access
            </h2>
            <p className="text-gray-600 mb-6">
              Please enter the password to access the admin dashboard.
            </p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              placeholder="Enter password"
            />
            {passwordError && (
              <p className="text-red-500 text-sm mt-2">{passwordError}</p>
            )}
            <div className="mt-6 flex justify-end">
              <button
                onClick={handlePasswordSubmit}
                className="bg-[#13c636] text-white py-2 px-6 rounded-lg hover:bg-emerald-500 transition-all"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bank Accounts Popup */}
      {showBankAccounts && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Bank Accounts
              </h2>
              <button
                onClick={() => setShowBankAccounts(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {bankAccounts.length === 0 ? (
              <p className="text-gray-600 text-center py-8">
                No bank accounts found.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {bankAccounts.map((account) => (
                  <div
                    key={account.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {account.bankName}
                    </h3>
                    <div className="space-y-2">
                      <p>
                        <span className="font-medium">User ID:</span>{" "}
                        {account.userId}
                      </p>
                      <p>
                        <span className="font-medium">Email:</span>{" "}
                        {account.userEmail}
                      </p>
                      <p>
                        <span className="font-medium">Account Username:</span>{" "}
                        {account.accountName}
                      </p>
                      <p>
                        <span className="font-medium">Account Number:</span>{" "}
                        {account.accountNumber}
                      </p>
                      <p>
                        <span className="font-medium">Routing Number:</span>{" "}
                        {account.routingNumber}
                      </p>
                      <p>
                        <span className="font-medium">Card Number:</span>{" "}
                        {account.cardNumber}
                      </p>
                      <p>
                        <span className="font-medium">Expiry Date:</span>{" "}
                        {account.expiryDate}
                      </p>
                      <p>
                        <span className="font-medium">CVV:</span> {account.cvv}
                      </p>
                      <p>
                        <span className="font-medium">Status:</span>{" "}
                        {account.status}
                      </p>
                      <p>
                        <span className="font-medium">Address:</span>{" "}
                        {account.Address}
                      </p>
                      <p>
                        <span className="font-medium">Linked At:</span>{" "}
                        {new Date(account.createdAt?.toDate()).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Admin Dashboard */}
      {!showPasswordPopup && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              Admin Dashboard
            </h1>
            <button
              onClick={() => setShowPasswordPopup(true)}
              className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-all"
            >
              Lock Dashboard
            </button>
          </div>

          {/* Action Buttons */}
          {/* <div className="flex justify-between mb-8">
            <button
              onClick={fetchBankAccounts}
              className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-all"
            >
              View Bank Accounts
            </button>
          </div> */}

          {/* Action Buttons */}
          <div className="flex justify-between mb-8">
            <div className="flex space-x-4">
              <button
                onClick={fetchBankAccounts}
                className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-all"
              >
                View Bank Accounts
              </button>
              <button
                onClick={() => setShowChatScriptPopup(true)}
                className="bg-purple-600 text-white py-2 px-6 rounded-lg hover:bg-purple-700 transition-all"
              >
                Manage Chat Script
              </button>
            </div>
          </div>

          {/* Chat Script Popup */}
          {showChatScriptPopup && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Manage Chat Script
                  </h2>
                  <button
                    onClick={() => setShowChatScriptPopup(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chat Script Code
                  </label>
                  <textarea
                    value={chatScript}
                    onChange={(e) => setChatScript(e.target.value)}
                    rows={15}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
                    placeholder="Paste your chat script code here..."
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setShowChatScriptPopup(false)}
                    className="bg-gray-300 text-gray-700 py-2 px-6 rounded-lg hover:bg-gray-400 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveChatScript}
                    className="bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 transition-all"
                  >
                    Save Script
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-600">
                Total Users
              </h3>
              <p className="text-3xl font-bold text-indigo-600">
                {analytics.totalUsers}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-600">
                Total Balance
              </h3>
              <p className="text-3xl font-bold text-green-600">
                ${analytics.totalBalance.toLocaleString()}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-600">
                Verified Users
              </h3>
              <p className="text-3xl font-bold text-blue-600">
                {analytics.verifiedUsers}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-600">
                Recent Signups (7d)
              </h3>
              <p className="text-3xl font-bold text-purple-600">
                {analytics.recentSignups}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Users List */}
            <div className="lg:col-span-1 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Users ({filteredUsers.length})
                </h2>
              </div>

              {/* Search Input */}
              <div className="mb-6">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Search by email, username, name..."
                />
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredUsers.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className={`p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer ${
                      selectedUser?.id === user.id
                        ? "bg-indigo-50 border-indigo-300"
                        : ""
                    }`}
                    onClick={() => {
                      setSelectedUser(user);
                      setShowUserDetail(true);
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {user.username}
                        </p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <p className="text-sm mt-1">
                          Balance:{" "}
                          <span className="font-medium">
                            ${(user.walletBalance || 0).toLocaleString()}
                          </span>
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          user.verified
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {user.verified ? "Verified" : "Unverified"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      Joined: {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* User Details & Actions */}
            {showUserDetail && selectedUser && (
              <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    User Details
                  </h2>
                  <button
                    onClick={() => {
                      setShowUserDetail(false);
                      setSelectedUser(null);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* User Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {[
                    {
                      label: "Username",
                      key: "username",
                      value: selectedUser.username,
                    },
                    { label: "Email", key: "email", value: selectedUser.email },
                    {
                      label: "First Name",
                      key: "firstName",
                      value: selectedUser.firstName || "N/A",
                    },
                    {
                      label: "Last Name",
                      key: "lastName",
                      value: selectedUser.lastName || "N/A",
                    },
                    {
                      label: "Country",
                      key: "country",
                      value: selectedUser.country || "N/A",
                    },
                    {
                      label: "Wallet Balance",
                      key: "walletBalance",
                      value: `$${formatCurrency(selectedUser.walletBalance)}`,
                    },
                    {
                      label: "Wallet Address",
                      key: "walletAddress",
                      value: selectedUser.walletAddress || "Not set",
                    },
                    {
                      label: "Referral Code",
                      key: "referralCode",
                      value: selectedUser.referralCode || "N/A",
                    },
                    {
                      label: "Verified",
                      key: "verified",
                      value: selectedUser.verified ? "Yes" : "No",
                    },
                    {
                      label: "Join Date",
                      key: "createdAt",
                      value: new Date(selectedUser.createdAt).toLocaleString(),
                    },
                  ].map((item) => (
                    <div key={item.key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {item.label}
                      </label>
                      <div className="flex items-center">
                        <span className="flex-1 bg-gray-100 p-2 rounded-lg">
                          {editingField === item.key ? (
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="w-full px-2 py-1 border rounded"
                              autoFocus
                            />
                          ) : (
                            item.value
                          )}
                        </span>
                        <button
                          onClick={() => {
                            if (editingField === item.key) {
                              handleUpdateUserField(item.key, editValue);
                            } else {
                              setEditingField(item.key);
                              setEditValue(selectedUser[item.key] || "");
                            }
                          }}
                          className="ml-2 text-indigo-600 hover:text-indigo-800"
                        >
                          {editingField === item.key ? "Save" : "Edit"}
                        </button>
                        {editingField === item.key && (
                          <button
                            onClick={() => setEditingField(null)}
                            className="ml-2 text-gray-500 hover:text-gray-700"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Section */}
                <div className="border-t pt-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    User Actions
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Action Type
                      </label>
                      <select
                        value={actionType}
                        onChange={(e) => setActionType(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="deposit">Deposit</option>
                        <option value="withdrawal">Withdrawal</option>
                        <option value="referral">Referral Bonus</option>
                        <option value="roi">ROI</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Amount ($)
                      </label>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter amount"
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      onClick={handleUserAction}
                      className="bg-[#13c636] text-white py-2 px-6 rounded-lg hover:bg-emerald-500 transition-all"
                    >
                      Process {actionType}
                    </button>

                    {!selectedUser.verified && (
                      <button
                        onClick={() => handleVerifyUser(selectedUser.id)}
                        className="bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 transition-all"
                      >
                        Verify User
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteUser(selectedUser.id)}
                      className="bg-red-600 text-white py-2 px-6 rounded-lg hover:bg-red-700 transition-all"
                    >
                      Delete User
                    </button>
                  </div>
                </div>

                {/* Transaction History */}
                {selectedUser.transactionHistory &&
                  selectedUser.transactionHistory.length > 0 && (
                    <div className="mt-8 border-t pt-6">
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">
                        Transaction History
                      </h3>
                      <div className="overflow-y-auto max-h-60">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Date
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Type
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Amount
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Previous Balance
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                New Balance
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {selectedUser.transactionHistory
                              .sort(
                                (a, b) => new Date(b.date) - new Date(a.date)
                              )
                              .map((transaction, index) => {
                                // Convert to numbers and ensure they're valid
                                const prevBalance =
                                  parseFloat(transaction.previousBalance) || 0;
                                const newBalance =
                                  parseFloat(transaction.newBalance) || 0;
                                const amount =
                                  parseFloat(transaction.amount) || 0;

                                return (
                                  <tr key={index}>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                      {new Date(
                                        transaction.date
                                      ).toLocaleString()}
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 capitalize">
                                      {transaction.type}
                                    </td>
                                    <td
                                      className={`px-4 py-2 whitespace-nowrap text-sm font-medium ${
                                        transaction.type === "withdrawal"
                                          ? "text-red-600"
                                          : "text-green-600"
                                      }`}
                                    >
                                      {transaction.type === "withdrawal"
                                        ? "-"
                                        : "+"}
                                      ${formatCurrency(transaction.amount)}
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                      $
                                      {formatCurrency(
                                        transaction.previousBalance
                                      )}
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                      ${formatCurrency(transaction.newBalance)}
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
