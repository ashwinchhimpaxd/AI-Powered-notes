import React, { useState } from "react";
import { CalendarBlank, X, Plus } from "@phosphor-icons/react";

const handleDateChange = (val, setter, prevValue) => {
  // If user is deleting, just let them delete.
  if (prevValue && val.length < prevValue.length) {
    if (prevValue.endsWith("-") && val.endsWith("-")) {
      val = val.slice(0, -1);
    }
    setter(val);
    return;
  }

  // Only keep digits
  const clean = val.replace(/\D/g, "");

  let formatted = "";
  if (clean.length > 0) {
    if (clean.length <= 4) {
      formatted = clean;
      if (clean.length === 4) formatted += "-";
    } else if (clean.length <= 6) {
      formatted = `${clean.slice(0, 4)}-${clean.slice(4)}`;
      if (clean.length === 6) formatted += "-";
    } else {
      formatted = `${clean.slice(0, 4)}-${clean.slice(4, 6)}-${clean.slice(6, 8)}`;
    }
  }

  setter(formatted);
};

/**
 * DateRangeFilter Component
 * Input fields for Start and End date, along with toggleable Drafts/Shared status tags.
 */
const DateRangeFilter = ({ startDate, setStartDate, endDate, setEndDate }) => {
  const [draftsActive, setDraftsActive] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <span className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest">
        Date Range
      </span>

      <div className="grid grid-cols-2 gap-4">
        {/* Start Date */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="filter-start-date" className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-wider">
            <CalendarBlank size={12} className="text-purple-400" />
            <span>Start</span>
          </label>
          <input
            id="filter-start-date"
            type="text"
            placeholder="YYYY-MM-DD"
            value={startDate || ""}
            maxLength={10}
            onChange={(e) => handleDateChange(e.target.value, setStartDate, startDate)}
            className="w-full bg-background/80 border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-[#b49cf8]/30 focus:bg-background transition-colors"
          />
        </div>

        {/* End Date */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="filter-end-date" className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-wider">
            <CalendarBlank size={12} className="text-purple-400" />
            <span>End</span>
          </label>
          <input
            id="filter-end-date"
            type="text"
            placeholder="YYYY-MM-DD"
            value={endDate || ""}
            maxLength={10}
            onChange={(e) => handleDateChange(e.target.value, setEndDate, endDate)}
            className="w-full bg-background/80 border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-[#b49cf8]/30 focus:bg-background transition-colors"
          />
        </div>
      </div>

      {/* Badges/Tags Row */}
      <div className="flex items-center gap-2.5 pt-1">
        {/* Drafts tag */}
        <button
          type="button"
          onClick={() => setDraftsActive(!draftsActive)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-extrabold uppercase tracking-widest transition-all cursor-pointer ${
            draftsActive
              ? "bg-muted/40 border-[#b49cf8]/30 text-foreground"
              : "bg-card border-border text-muted-foreground/60"
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${draftsActive ? "bg-[#b49cf8]" : "bg-muted-foreground/35"}`} />
          <span>Drafts</span>
          {draftsActive ? <X size={10} weight="bold" /> : <Plus size={10} weight="bold" />}
        </button>


      </div>
    </div>
  );
};

export default DateRangeFilter;
