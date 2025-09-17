import React from 'react';

const Timer: React.FC<{ time: number }> = ({ time }) => {
  const minutes = Math.floor(time / 60).toString().padStart(2, '0');
  const seconds = (time % 60).toString().padStart(2, '0');
  return (
    <div className="my-12 text-center text-5xl font-light tracking-widest opacity-90">
      {minutes}:{seconds}
    </div>
  );
};

export default Timer;
