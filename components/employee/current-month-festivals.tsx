"use client";

import { UpcomingFestivalsStrip } from "./upcoming-festivals-strip";

interface CurrentMonthFestivalsProps {
  max?: number;
}

export function CurrentMonthFestivals({ max }: CurrentMonthFestivalsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">This Month's Festivals</h3>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </div>
      </div>
      <div className="h-40 overflow-x-auto overflow-y-hidden pr-2 pb-2 touch-pan-x select-none">
        <UpcomingFestivalsStrip max={max} showCurrentMonthOnly={true} />
      </div>
    </div>
  );
}
