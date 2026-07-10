import { motion } from "framer-motion";
import { ReactNode } from "react";

interface KpiCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  delay?: number;
}

export function KpiCard({ title, value, icon, delay = 0 }: KpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-card p-5 rounded-xl border shadow-sm flex flex-col justify-between h-[120px] hover:shadow-md transition-shadow group relative overflow-hidden"
    >
      <div className="flex justify-between items-start">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</h3>
        {icon && <div className="text-muted-foreground/50 group-hover:text-primary transition-colors">{icon}</div>}
      </div>
      <div className="mt-auto">
        <div className="text-3xl font-bold text-card-foreground leading-none">{value}</div>
      </div>
    </motion.div>
  );
}
