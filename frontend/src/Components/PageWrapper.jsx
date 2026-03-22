import React from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

export default function PageWrapper({ children, className = "" }) {
  const location = useLocation();

  return (
    <motion.div
      key={location.pathname}
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
