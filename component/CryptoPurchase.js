'use client' // Mark as a Client Component

import { useState } from 'react'
import { motion } from 'framer-motion'

const countryData = {
  'South Africa': [
    { name: 'Luno', url: 'www.Luno.com', info: 'Luno is a global cryptocurrency exchange that allows you to buy, sell, and store Bitcoin and other cryptocurrencies.' },
    { name: 'Altcoin Trader', url: 'www.altcointrader.co.za', info: 'Altcoin Trader is a South African cryptocurrency exchange offering a wide range of altcoins.' },
    { name: 'LocalBitcoins', url: 'www.localbitcoin.com', info: 'LocalBitcoins is a peer-to-peer Bitcoin exchange that allows you to buy and sell Bitcoin directly with other users.' },
    { name: 'Coinmama', url: 'www.coinmama.com', info: 'Coinmama is a cryptocurrency exchange that allows you to buy Bitcoin and other cryptocurrencies with a credit card.' },
  ],
  Kenya: [
    { name: 'Belfrics', url: 'www.belfrics.io', info: 'Belfrics is a global cryptocurrency exchange with a strong presence in Kenya.' },
    { name: 'Altcoin Trader', url: 'www.altcointrader.co.za', info: 'Altcoin Trader is a South African cryptocurrency exchange offering a wide range of altcoins.' },
    { name: 'BitPesa', url: 'www.bitpesa.com', info: 'BitPesa is a Bitcoin remittance service that allows you to send and receive money across borders.' },
    { name: 'Coinmama', url: 'www.coinmama.com', info: 'Coinmama is a cryptocurrency exchange that allows you to buy Bitcoin and other cryptocurrencies with a credit card.' },
    { name: 'Remitano', url: 'www.remitano.com', info: 'Remitano is a peer-to-peer Bitcoin exchange that allows you to buy and sell Bitcoin directly with other users.' },
  ],
  Nigeria: [
    { name: 'Luno', url: 'www.Luno.com', info: 'Luno is a global cryptocurrency exchange that allows you to buy, sell, and store Bitcoin and other cryptocurrencies.' },
    { name: 'Remitano', url: 'www.remitano.com', info: 'Remitano is a peer-to-peer Bitcoin exchange that allows you to buy and sell Bitcoin directly with other users.' },
    { name: 'LocalBitcoins', url: 'www.localbitcoin.com', info: 'LocalBitcoins is a peer-to-peer Bitcoin exchange that allows you to buy and sell Bitcoin directly with other users.' },
  ],
  Botswana: [
    { name: 'SpectroCoin', url: 'www.spectrocoin.com', info: 'SpectroCoin is a cryptocurrency exchange that offers a wide range of services, including buying and selling Bitcoin.' },
    { name: 'Flux', url: 'www.flux.com', info: 'Flux is a cryptocurrency exchange that allows you to buy and sell Bitcoin and other cryptocurrencies.' },
    { name: 'LocalBitcoins', url: 'www.localbitcoin.com', info: 'LocalBitcoins is a peer-to-peer Bitcoin exchange that allows you to buy and sell Bitcoin directly with other users.' },
    { name: 'Coinmama', url: 'www.coinmama.com', info: 'Coinmama is a cryptocurrency exchange that allows you to buy Bitcoin and other cryptocurrencies with a credit card.' },
  ],
  Ghana: [
    { name: 'LocalBitcoins', url: 'www.localbitcoin.com', info: 'LocalBitcoins is a peer-to-peer Bitcoin exchange that allows you to buy and sell Bitcoin directly with other users.' },
    { name: 'Coinmama', url: 'www.coinmama.com', info: 'Coinmama is a cryptocurrency exchange that allows you to buy Bitcoin and other cryptocurrencies with a credit card.' },
  ],
  Namibia: [
    { name: 'Altcoin Trader', url: 'www.altcointrader.co.za', info: 'Altcoin Trader is a South African cryptocurrency exchange offering a wide range of altcoins.' },
    { name: 'Coinmama', url: 'www.coinmama.com', info: 'Coinmama is a cryptocurrency exchange that allows you to buy Bitcoin and other cryptocurrencies with a credit card.' },
  ],
  Malawi: [
    { name: 'CEX.IO', url: 'www.cex.io', info: 'CEX.IO is a global cryptocurrency exchange that allows you to buy, sell, and trade Bitcoin and other cryptocurrencies.' },
    { name: 'Coinmama', url: 'www.coinmama.com', info: 'Coinmama is a cryptocurrency exchange that allows you to buy Bitcoin and other cryptocurrencies with a credit card.' },
  ],
  Mozambique: [
    { name: 'Coinmama', url: 'www.coinmama.com', info: 'Coinmama is a cryptocurrency exchange that allows you to buy Bitcoin and other cryptocurrencies with a credit card.' },
  ],
  'Swaziland/Lesotho': [
    { name: 'Altcoin Trader', url: 'www.altcointrader.co.za', info: 'Altcoin Trader is a South African cryptocurrency exchange offering a wide range of altcoins.' },
    { name: 'Coinmama', url: 'www.coinmama.com', info: 'Coinmama is a cryptocurrency exchange that allows you to buy Bitcoin and other cryptocurrencies with a credit card.' },
  ],
  Zimbabwe: [
    { name: 'LocalBitcoins', url: 'www.localbitcoin.com', info: 'LocalBitcoins is a peer-to-peer Bitcoin exchange that allows you to buy and sell Bitcoin directly with other users.' },
    { name: 'Golix', url: 'www.golix.com', info: 'Golix is a cryptocurrency exchange that allows you to buy and sell Bitcoin and other cryptocurrencies.' },
  ],
  Tanzania: [
    { name: 'Altcoin Trader', url: 'www.altcointrader.co.za', info: 'Altcoin Trader is a South African cryptocurrency exchange offering a wide range of altcoins.' },
    { name: 'Remitano', url: 'www.remitano.com', info: 'Remitano is a peer-to-peer Bitcoin exchange that allows you to buy and sell Bitcoin directly with other users.' },
    { name: 'Coinmama', url: 'www.coinmama.com', info: 'Coinmama is a cryptocurrency exchange that allows you to buy Bitcoin and other cryptocurrencies with a credit card.' },
  ],
  'United Kingdom': [
    { name: 'Luno', url: 'www.Luno.com', info: 'Luno is a global cryptocurrency exchange that allows you to buy, sell, and store Bitcoin and other cryptocurrencies.' },
    { name: 'Worldwide Bitcoin', url: 'www.worldwidebitcoin.com', info: 'Worldwide Bitcoin is a cryptocurrency exchange that allows you to buy and sell Bitcoin.' },
    { name: 'LocalBitcoins', url: 'www.localbitcoin.com', info: 'LocalBitcoins is a peer-to-peer Bitcoin exchange that allows you to buy and sell Bitcoin directly with other users.' },
    { name: 'SpectroCoin', url: 'www.spectrocoin.com', info: 'SpectroCoin is a cryptocurrency exchange that offers a wide range of services, including buying and selling Bitcoin.' },
  ],
  'United States': [
    { name: 'Binance', url: 'www.binance.com', info: 'binance is a global cryptocurrency exchange that allows you to buy, sell, and store Bitcoin and other cryptocurrencies.' },
    { name: 'Coinbase', url: 'www.coinbase.com', info: 'Coinbase is a popular cryptocurrency exchange that allows you to buy, sell, and store Bitcoin and other cryptocurrencies.' },
    { name: 'Bybit', url: 'www.bybit.com', info: 'bybit is a cryptocurrency exchange that allows you to buy Bitcoin and other cryptocurrencies with a credit card.' },
  ],
  India: [
    { name: 'LocalBitcoins', url: 'www.localbitcoin.com', info: 'LocalBitcoins is a peer-to-peer Bitcoin exchange that allows you to buy and sell Bitcoin directly with other users.' },
    { name: 'Coinbase', url: 'www.coinbase.com', info: 'Coinbase is a popular cryptocurrency exchange that allows you to buy, sell, and store Bitcoin and other cryptocurrencies.' },
  ],
  Canada: [
    { name: 'Shakepay', url: 'www.shakepay.com', info: 'Shakepay is a Canadian cryptocurrency exchange that allows you to buy and sell Bitcoin and Ethereum.' },
    { name: 'LocalBitcoins', url: 'www.localbitcoin.com', info: 'LocalBitcoins is a peer-to-peer Bitcoin exchange that allows you to buy and sell Bitcoin directly with other users.' },
    { name: 'Coinbase', url: 'www.coinbase.com', info: 'Coinbase is a popular cryptocurrency exchange that allows you to buy, sell, and store Bitcoin and other cryptocurrencies.' },
  ],
  Philippines: [
    { name: 'Coins.ph', url: 'www.coins.ph', info: 'Coins.ph is a cryptocurrency exchange and wallet that allows you to buy, sell, and store Bitcoin and other cryptocurrencies.' },
  ],
  Malaysia: [
    { name: 'LocalBitcoins', url: 'www.localbitcoin.com', info: 'LocalBitcoins is a peer-to-peer Bitcoin exchange that allows you to buy and sell Bitcoin directly with other users.' },
    { name: 'Blockchain.com', url: 'www.blockchain.com', info: 'Blockchain.com is a cryptocurrency wallet and exchange that allows you to buy, sell, and store Bitcoin and other cryptocurrencies.' },
  ],
}

export default function CryptoPurchase() {
  const [selectedCountry, setSelectedCountry] = useState('United States')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredCountries = Object.keys(countryData).filter(country =>
    country.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen text-black">
      {/* Hero Section */}
      {/* <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto px-6 text-center"
        >
          <h1 className="text-4xl font-bold text-black mb-4">
            Buy Crypto Currency
          </h1>
          <p className="text-lg text-gray-200">
            Find trusted websites to purchase cryptocurrencies in your country.
          </p>
        </motion.div>
      </div> */}

      {/* Country Selection and Website List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="max-w-7xl mx-auto px-6 py-12"
      >
        {/* Country Search and Dropdown */}
        <div className="mb-8">
          <label
            htmlFor="country"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Select Your Country
          </label>
          <input
            type="text"
            placeholder="Search for your country..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all mb-4"
          />
          <select
            id="country"
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all mt-8"
          >
            {filteredCountries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>

        {/* Website List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {countryData[selectedCountry].map((website, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow relative"
            >
              <a
                href={`https://${website.url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg font-semibold text-black hover:text-indigo-500"
              >
                {website.name}
              </a>
              <div className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 cursor-pointer mb-8" title={website.info}>
                ℹ️
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Genie Information Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="py-8"
      >
      
      </motion.div>

      {/* Disclaimer Section */}
    
    </div>
  )
}