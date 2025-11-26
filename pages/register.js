'use client' // Mark as a Client Component

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc, updateDoc, getDocs, query, collection, where, arrayUnion } from 'firebase/firestore'
import { auth, db } from '@/firebase' // Adjust the import path as needed
import { useRouter } from 'next/navigation' // Import useRouter

export default function MultiStepRegistrationForm() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    country: '',
    securityQuestion: '',
    securityAnswer: '',
    walletAddress: '',
    referralCode: '', // Initialize as empty
    password: '',
    retypePassword: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter() // Initialize the router

  // Capture referral code from URL
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search)
    const referralCode = queryParams.get('ref')
    if (referralCode) {
      setFormData((prev) => ({ ...prev, referralCode })) // Update formData with referral code
    }
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const validateStep = () => {
    switch (step) {
      case 1:
        if (!formData.firstName || !formData.lastName || !formData.username) {
          setError('Please fill out all fields in Step 1.')
          return false
        }
        break
      case 2:
        if (!formData.email || !formData.country) {
          setError('Please fill out all fields in Step 2.')
          return false
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          setError('Please enter a valid email address.')
          return false
        }
        break
      case 3:
        if (!formData.securityQuestion || !formData.securityAnswer) {
          setError('Please fill out all fields in Step 3.')
          return false
        }
        break
     
      case 5:
        if (!formData.password || !formData.retypePassword) {
          setError('')
          return false
        }
        if (formData.password !== formData.retypePassword) {
          setError('Passwords do not match.')
          return false
        }
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters long.')
          return false
        }
        break
      default:
        return true
    }
    setError('')
    return true
  }

  const nextStep = () => {
    if (validateStep()) {
      setStep((prev) => prev + 1)
    }
  }

  const prevStep = () => setStep((prev) => prev - 1)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!validateStep()) {
      setLoading(false)
      return
    }

    try {
      // Create user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      )
      const user = userCredential.user

      // Save additional user data to Firestore (INCLUDING PASSWORD - NOT RECOMMENDED)
      await setDoc(doc(db, 'users', user.uid), {
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        email: formData.email,
        country: formData.country,
        securityQuestion: formData.securityQuestion,
        securityAnswer: formData.securityAnswer,
        walletAddress: formData.walletAddress,
        referralCode: formData.referralCode || null,
        password: formData.password, // ⚠️ INSECURE: Storing plain text password
        walletBalance: 0,
        transactionHistory: [],
        notifications: [],
        verified: false,
        createdAt: new Date().toISOString(),
      })

      // ... [rest of the referral code handling remains the same]

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8 text-black">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl p-8 sm:p-10">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Registration Form</h2>
          <p className="mt-2 text-sm text-gray-600">Please fill out the form to create your account.</p>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8">
          <AnimatePresence mode="wait">
            {/* Step 1: Personal Details */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                      First Name
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-black"
                      placeholder="Enter your first name"
                    />
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-black"
                      placeholder="Enter your last name"
                    />
                  </div>

                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                      Username
                    </label>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-black"
                      placeholder="Enter your username"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Contact Details */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      E-mail Address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-black"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                      Country
                    </label>
                    <select
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-black"
                    >
                      <option value="">- Select Country -</option>
                      <option value="USA">United States</option>
                      <option value="UK">United Kingdom</option>
                      <option value="Canada">Canada</option>
                      <option value="Australia">Australia</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Security Details */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-6">
                  <div>
                    <label htmlFor="securityQuestion" className="block text-sm font-medium text-gray-700">
                      Security Question
                    </label>
                    <select
                      id="securityQuestion"
                      name="securityQuestion"
                      value={formData.securityQuestion}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-black"
                    >
                      <option value="">Choose Your Security Question</option>
                      <option value="pet">What is the name of your first pet?</option>
                      <option value="school">What is the name of your first school?</option>
                      <option value="city">What city were you born in?</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="securityAnswer" className="block text-sm font-medium text-gray-700">
                      Security Answer
                    </label>
                    <input
                      id="securityAnswer"
                      name="securityAnswer"
                      type="text"
                      value={formData.securityAnswer}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-black"
                      placeholder="Enter your security answer"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Wallet and Referral */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-6">
                  <div className='hidden'>
                    <label htmlFor="walletAddress" className="block text-sm font-medium text-gray-700 ">
                      Bitcoin Wallet Address (optional)
                    </label>
                    <input
                      id="walletAddress"
                      name="walletAddress"
                      type="text"
                      value={formData.walletAddress}
                      onChange={handleChange}
                      
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-black"
                      placeholder="Enter your Bitcoin wallet address"
                    />
                  </div>

                  <div>
                    <label htmlFor="referralCode" className="block text-sm font-medium text-gray-700">
                      Referral Code (optional)
                    </label>
                    <input
                      id="referralCode"
                      name="referralCode"
                      type="text"
                      value={formData.referralCode}
                      onChange={handleChange}
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-black"
                      placeholder="Enter referral code (optional)"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 5: Password */}
            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-6">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-black"
                      placeholder="Enter your password"
                    />
                  </div>

                  <div>
                    <label htmlFor="retypePassword" className="block text-sm font-medium text-gray-700">
                      Retype Password
                    </label>
                    <input
                      id="retypePassword"
                      name="retypePassword"
                      type="password"
                      value={formData.retypePassword}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-black"
                      placeholder="Retype your password"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8 flex justify-between">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Back
              </button>
            )}
            {step < 5 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-4 py-2 text-sm font-medium text-white bg-[#3ecec6] rounded-lg hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-[#3ecec6] rounded-lg hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {loading ? 'Submitting...' : 'Submit'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}