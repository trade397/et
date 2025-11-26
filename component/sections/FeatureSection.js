import { SectionHeading } from "../SectionHeading";
import { FeatureCard } from "../cards/FeatureCard";
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

export function FeatureSection({
  title,
  description,
  badge,
  features,
  ...rest
}) {
  return (
    <motion.section
      className="bg-base-100 dark:bg-base-900 py-24"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }} // Trigger animation once when 20% of the section is visible
      variants={containerVariants}
      {...rest}
    >
      <div className="container px-4 mx-auto">
        {/* Animated Section Heading */}
        <motion.div variants={childVariants}>
          <SectionHeading
            align="center"
            title={title}
            description={description}
            badge={badge}
          />
        </motion.div>

        {/* Animated Feature Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 my-10"
          variants={containerVariants}
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={childVariants}>
              <FeatureCard {...feature} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}