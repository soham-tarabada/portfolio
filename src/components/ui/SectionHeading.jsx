import React from 'react';
import { motion } from 'framer-motion';

const SectionHeading = ({ title, subtitle }) => {
  return (
    <div className="text-center mb-16 relative">
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-primary-500 font-semibold tracking-wider uppercase text-sm mb-2"
      >
        {subtitle}
      </motion.p>
      <motion.h2 
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="text-3xl md:text-5xl font-bold dark:text-white"
      >
        {title}
      </motion.h2>
      <motion.div 
        initial={{ width: 0 }}
        whileInView={{ width: '80px' }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="h-1 bg-primary-500 mx-auto mt-6 rounded-full"
      />
    </div>
  );
};

export default SectionHeading;
