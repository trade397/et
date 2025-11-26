/* eslint-disable @next/next/no-img-element */
import React from "react";
import { SectionHeading } from "../SectionHeading";
import { Tabs } from "../base";
import { PricingCard } from "../cards";
import { motion } from "framer-motion"; // Import Framer Motion

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2, // Stagger animations for child elements
    },
  },
};

const childVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

export function PricingSection({
  title,
  description,
  badge,
  pricing,
  ...rest
}) {
  const [tenure, setTenure] = React.useState("yearly");

  return (
    <motion.section
      className="bg-base-100 dark:bg-base-900 py-24"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }} // Trigger animation once when 20% of the section is visible
      variants={containerVariants}
      {...rest}
    >
      <div className="container px-4 mx-auto min-h-screen">
        {/* Animated Section Heading */}
        <motion.div variants={childVariants}>
          <SectionHeading
            align="center"
            title={title}
            description={description}
            badge={badge}
          />
        </motion.div>

        {/* Animated Tabs */}
        <motion.div variants={childVariants} className="text-center my-10">
          <Tabs
            value={tenure}
            onChange={setTenure}
            options={["monthly", "yearly"]}
          />
          <div className="text-sm mt-4">15% Discount on Yearly Payment</div>
        </motion.div>

        {/* Animated Pricing Cards */}
        <motion.div
          className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6"
          variants={containerVariants}
        >
          {pricing.map((price, index) => (
            <motion.div key={index} variants={childVariants}>
              <PricingCard {...price} tenure={tenure} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}