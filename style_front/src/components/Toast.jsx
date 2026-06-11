import React, { useEffect, useState } from 'react';

const Toast = ({ message, onDone }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setVisible(false), 2200);
    const doneTimer = setTimeout(onDone, 2700);
    return () => { clearTimeout(fadeTimer); clearTimeout(doneTimer); };
  }, [onDone]);

  return (
    <div
      className={`fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2.5 bg-[#251D16] border border-primary/30 text-white px-4 py-2.5 rounded-xl shadow-2xl shadow-black/40 text-sm font-medium transition-all duration-500 whitespace-nowrap ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
      }`}
    >
      <span className="material-symbols-outlined icon-filled text-primary text-[16px]">check_circle</span>
      {message}
    </div>
  );
};

export default Toast;
