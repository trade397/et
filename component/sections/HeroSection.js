/* eslint-disable @next/next/no-img-element */
import { Badge, Button } from "../base";
import { Brands } from "../Brands";
import { cn } from "@/lib/utils";
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

const videoVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 100 } },
};

export function HeroSection({
  badge,
  title,
  description,
  buttons,
  image,
  clientsLabel,
  clients,
  ...rest
}) {
  return (
    <section {...rest}>
      <div className="container px-4 mx-auto">
        <motion.div
          className="flex flex-col justify-center items-center min-h-screen"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Animated Badge */}
          <motion.div variants={childVariants} className="flex flex-col justify-center items-center gap-4 text-center max-w-3xl mx-auto mt-32 pb-12">
            <Badge {...badge} />
            {/* Animated Title */}
            <motion.h1
              variants={childVariants}
              className="text-6xl font-display font-semibold title-gradient"
            >
              {title}
            </motion.h1>
            {/* Animated Description */}
            <motion.p variants={childVariants} className="text-xl">
              {description}
            </motion.p>
            {/* Animated Buttons */}
            {buttons.length > 0 && (
              <motion.div
                variants={childVariants}
                className="flex justify-center items-center gap-4 mt-8"
              >
                {buttons.map((button, index) => (
                  <Button key={index} {...button} />
                ))}
              </motion.div>
            )}
          </motion.div>

          {/* Animated Video */}
          <motion.div variants={videoVariants}>
            <video
              src={image.src}
              alt={image.alt}
              className={cn("w-full h-auto", image.className)}
              autoPlay
              loop
              muted
            >
              Your browser does not support the video tag.
            </video>
          </motion.div>

          {/* Animated Clients Label */}
          <motion.div variants={childVariants} className="text-sm mt-20">
            {clientsLabel}
          </motion.div>

          {/* Animated Brands */}
          <motion.div variants={childVariants}>
            <Brands clients={clients} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}