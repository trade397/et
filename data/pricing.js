export const pricing = [
  {
    name: "Starter Plan",
    description: "For beginners looking to start investing",
    value: {
      monthly: 1000,
      yearly: 1000,
    },
    unit: "per month",
    currency: "$",
    features: [
      "Access to basic investment options (gold, crypto)",
      "Portfolio tracking",
      "Educational resources",
      "Email support",
    ],
    button: {
      label: "Get started",
      href: "/signup",
      color: "light",
      icon: "tabler:arrow-right",
    },
  },
  {
    name: "Premium Plan",
    description: "For serious investors seeking higher returns",
    value: {
      monthly: 15000,
      yearly: 11000,
    },
    unit: "per month",
    currency: "$",
    features: [
      "All Starter Plan features",
      "Access to advanced investment options (stocks, real estate)",
      "Priority customer support",
      "Personalized investment strategies",
      "Monthly portfolio reviews",
    ],
    button: {
      label: "Start free trial",
      href: "/signup",
      icon: "tabler:rocket",
    },
  },
  {
    name: "VIP Plan",
    description: "For high-net-worth individuals and institutions",
    value: {
      monthly: 30000,
      yearly: 28000,
    },
    unit: "per month",
    currency: "$",
    features: [
      "All Premium Plan features",
      "Dedicated account manager",
      "Exclusive investment opportunities",
      "Custom portfolio management",
      "24/7 priority support",
    ],
    button: {
      label: "Contact us",
      href: "/contact",
      color: "light",
      icon: "tabler:mail",
    },
  },
];