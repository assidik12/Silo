'use client';

import { useState, useEffect } from 'react';
import { checkTaskMilestone } from '@/app/actions/feedback.actions';
import FeedbackModal from './FeedbackModal';

export default function MilestoneFeedbackTrigger() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const runCheck = async () => {
      const { shouldShow } = await checkTaskMilestone();
      if (shouldShow) {
        // Delay a bit after mount so it's not jarring
        setTimeout(() => setShow(true), 3000);
      }
    };
    runCheck();
  }, []);

  return (
    <FeedbackModal 
      isOpen={show}
      onClose={() => setShow(false)}
      type="milestone"
      title="Wih, lo udah kelarin 5 tugas! 🎉"
      description="Gimana rasanya nugas pake Silo sejauh ini? Kasih tau kita dong biar makin mantap!"
    />
  );
}
