import { motion, AnimatePresence } from 'motion/react';

interface BeadsViewerProps {
  currentCount: number;
  targetCount: number;
  theme: 'emerald' | 'amber' | 'indigo' | 'slate';
}

export default function BeadsViewer({ currentCount, targetCount, theme }: BeadsViewerProps) {
  // Generate an array of bead indices relative to the currentCount
  // We show about 7 beads around the active center
  const beadOffsets = [-3, -2, -1, 0, 1, 2, 3];

  const getColorClass = () => {
    switch (theme) {
      case 'emerald':
        return {
          active: 'bg-emerald-600 shadow-emerald-200/50 text-emerald-100 border-emerald-500',
          inactive: 'bg-emerald-100 text-emerald-600 border-emerald-200',
          string: 'bg-emerald-800/20',
        };
      case 'amber':
        return {
          active: 'bg-amber-600 shadow-amber-200/50 text-amber-100 border-amber-500',
          inactive: 'bg-amber-100 text-amber-600 border-amber-200',
          string: 'bg-amber-800/20',
        };
      case 'indigo':
        return {
          active: 'bg-indigo-600 shadow-indigo-200/50 text-indigo-100 border-indigo-500',
          inactive: 'bg-indigo-100 text-indigo-600 border-indigo-200',
          string: 'bg-indigo-800/20',
        };
      case 'slate':
      default:
        return {
          active: 'bg-slate-700 shadow-slate-200/50 text-slate-100 border-slate-600',
          inactive: 'bg-slate-100 text-slate-700 border-slate-200',
          string: 'bg-slate-800/20',
        };
    }
  };

  const colors = getColorClass();

  return (
    <div className="relative h-20 w-full flex items-center justify-center overflow-hidden py-2" id="beads-container">
      {/* Decorative Sufi/Arabic pattern background layer */}
      <div className="absolute inset-0 opacity-5 flex items-center justify-center pointer-events-none select-none">
        <svg width="200" height="200" viewBox="0 0 100 100" className="animate-spin-slow">
          <path d="M50 0 L60 40 L100 50 L60 60 L50 100 L40 60 L0 50 L40 40 Z" fill="currentColor" />
          <circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>

      {/* The Thread / String */}
      <div className={`absolute left-0 right-0 h-1.5 ${colors.string} rounded-full`} id="beads-thread" />

      {/* Beads layout */}
      <div className="relative w-full max-w-xs h-full flex items-center justify-center">
        {beadOffsets.map((offset) => {
          // Calculate the bead value (infinite loop of 1 to targetCount/33)
          const beadIndex = currentCount + offset;
          if (beadIndex < 0) return null; // don't show negative beads

          // Distance from center determines scaling & styling
          const isCenter = offset === 0;
          const absOffset = Math.abs(offset);
          const opacity = Math.max(0.15, 1 - absOffset * 0.25);
          const scale = isCenter ? 1.35 : 1 - absOffset * 0.12;

          return (
            <motion.div
              key={beadIndex}
              layout
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 25,
              }}
              className="absolute flex flex-col items-center justify-center"
              style={{
                x: `${offset * 44}px`, // distance apart
                opacity,
                scale,
                zIndex: 10 - absOffset,
              }}
            >
              <div
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-mono font-semibold text-sm transition-colors duration-150 ${
                  isCenter ? `${colors.active} shadow-lg ring-4 ring-white/15` : colors.inactive
                }`}
                style={{
                  clipPath: 'polygon(50% 0%, 90% 20%, 100% 60%, 75% 100%, 25% 100%, 0% 60%, 10% 20%)', // carved Islamic polygon bead shape
                }}
              >
                {/* Visual number inside the bead */}
                <span>{beadIndex === 0 ? '•' : (beadIndex % targetCount === 0 ? targetCount : beadIndex % targetCount)}</span>
              </div>
              
              {/* Subtle bead separator accent */}
              <div className="h-2 w-0.5 bg-neutral-300 dark:bg-neutral-700/60 mt-0.5" />
            </motion.div>
          );
        })}
      </div>

      {/* Active center bead indicators */}
      <div className="absolute top-0 bottom-0 flex flex-col justify-between items-center pointer-events-none w-12 py-1">
        <div className={`w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] ${theme === 'emerald' ? 'border-t-emerald-600' : theme === 'amber' ? 'border-t-amber-500' : theme === 'slate' ? 'border-t-slate-700' : 'border-t-indigo-600'}`} />
        <div className={`w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] ${theme === 'emerald' ? 'border-b-emerald-600' : theme === 'amber' ? 'border-b-amber-500' : theme === 'slate' ? 'border-b-slate-700' : 'border-b-indigo-600'}`} />
      </div>
    </div>
  );
}
