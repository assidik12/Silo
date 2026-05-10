'use client';

import { useState, useEffect } from 'react';
import PersonalizationModal from './PersonalizationModal';

export default function PersonalizationTrigger({ completed }: { completed: boolean }) {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!completed) {
      // Small delay for better UX after page load
      const timer = setTimeout(() => setShowModal(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [completed]);

  return (
    <PersonalizationModal 
      isOpen={showModal} 
      onClose={() => setShowModal(false)} 
    />
  );
}
