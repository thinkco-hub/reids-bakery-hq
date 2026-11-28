import React from "react";
import { Calendar03Icon } from "../icons";

export default function CalendarView() {
  return (
    <div className="max-w-6xl mx-auto h-[80vh] flex flex-col animate-fadeIn w-full">
      <header className="mb-6 md:mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-espresso">
          Delivery Scheduler
        </h2>
        <p className="text-espresso/70 mt-1 font-medium text-sm md:text-base">
          Coming soon — Google Calendar integration
        </p>
      </header>

      <div className="flex-1 bg-white rounded-lg shadow-sm border border-caramel flex items-center justify-center p-4 md:p-8">
        <div className="text-center">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-caramel/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar03Icon className="w-8 h-8 md:w-10 md:h-10 text-brand-strong" />
          </div>
          <h3 className="text-lg md:text-xl font-bold text-espresso mb-2">
            Calendar view is coming soon
          </h3>
          <p className="text-espresso/70 max-w-sm md:max-w-md mx-auto text-sm md:text-base">
            Delivery scheduling will appear here once the Google Calendar integration ships.
          </p>
        </div>
      </div>
    </div>
  );
}