"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface AccordionItem {
  id: number | string;
  question: string;
  answer: string;
  category?: string;
}

interface AccordionProps {
  items: AccordionItem[];
  className?: string;
}

export function Accordion({ items, className }: AccordionProps) {
  const [openId, setOpenId] = useState<number | string | null>(null);

  return (
    <div className={cn("space-y-2", className)}>
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div
            key={item.id}
            className="border border-laser-500/20 rounded-xl overflow-hidden"
          >
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : item.id)}
              className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left
                         bg-navy-800/60 hover:bg-navy-700/60 transition-colors"
              aria-expanded={isOpen}
            >
              <span className="font-medium text-white text-sm sm:text-base">
                {item.question}
              </span>
              <svg
                className={cn(
                  "shrink-0 w-5 h-5 text-laser-400 transition-transform duration-200",
                  isOpen && "rotate-180"
                )}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div
              className={cn(
                "overflow-hidden transition-all duration-300",
                isOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
              )}
              aria-hidden={!isOpen}
            >
              <div className="px-5 pb-5 pt-1 text-white/60 text-sm sm:text-base leading-relaxed border-t border-laser-500/10">
                {item.answer}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
