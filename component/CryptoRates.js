'use client' // Mark as a Client Component

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaSearch } from 'react-icons/fa'

export default function CryptoRates() {
  const [cryptoData, setCryptoData] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch cryptocurrency data from CoinGecko API
  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false'
        )
        const data = await response.json()
        setCryptoData(data)
      } catch (error) {
        console.error('Error fetching cryptocurrency data:', error)
      }
    }

    fetchCryptoData()
  }, [])

  // Filter cryptocurrencies based on search query
  const filteredCryptoData = cryptoData.filter((crypto) =>
    crypto.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-black">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        <h1 className="text-3xl font-bold text-gray-900 ">Crypto Rates</h1>

        {/* Search Bar */}
        <div className="mb-16 mt-6">
          <div className="relative">
            <input
              type="text"
              placeholder="      Search cryptocurrencies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all "
            />
            {/* <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div> */}
          </div>
        </div>

        {/* Crypto Rates Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
          {filteredCryptoData.map((crypto) => (
            <motion.div
              key={crypto.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={crypto.image}
                  alt={crypto.name}
                  className="size-8"
                />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {crypto.name}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {crypto.symbol.toUpperCase()}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-500">Price (USD)</p>
                <p className="text-lg font-semibold text-gray-900">
                  ${crypto.current_price.toLocaleString()}
                </p>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-500">24h Change</p>
                <p
                  className={`text-lg font-semibold ${
                    crypto.price_change_percentage_24h > 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {crypto.price_change_percentage_24h.toFixed(2)}%
                </p>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-500">Market Cap</p>
                <p className="text-lg font-semibold text-gray-900">
                  ${crypto.market_cap.toLocaleString()}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}