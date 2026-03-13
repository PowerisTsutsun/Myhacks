"use client";

import { motion } from "framer-motion";
import { Accordion } from "@/components/ui/Accordion";

interface FaqItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

interface FaqPreviewProps {
  items: FaqItem[];
}

export function FaqPreview({ items }: FaqPreviewProps) {
  if (items.length === 0) return null;

  return (
    <section className="section-padding bg-navy-950/80">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <p className="text-laser-400 font-semibold text-base uppercase tracking-widest mb-3">
            FAQ
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Common questions
          </h2>
          <p className="text-white/65 text-lg">
            Everything you need to know about LaserHacks.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Accordion items={items.slice(0, 5)} />
        </motion.div>

      </div>
    </section>
  );
}
