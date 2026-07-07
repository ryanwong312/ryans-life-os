import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  trendValue,
  color = 'teal',
  className = '' 
}) {
  const colorClasses = {
    teal: 'from-teal-500/20 to-teal-600/10 text-teal-400 border-teal-500/20',
    indigo: 'from-indigo-500/20 to-indigo-600/10 text-indigo-400 border-indigo-500/20',
    purple: 'from-purple-500/20 to-purple-600/10 text-purple-400 border-purple-500/20',
    orange: 'from-orange-500/20 to-orange-600/10 text-orange-400 border-orange-500/20',
    pink: 'from-pink-500/20 to-pink-600/10 text-pink-400 border-pink-500/20',
    emerald: 'from-emerald-500/20 to-emerald-600/10 text-emerald-400 border-emerald-500/20',
    amber: 'from-amber-500/20 to-amber-600/10 text-amber-400 border-amber-500/20',
  };

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="w-3 h-3" />;
    if (trend === 'down') return <TrendingDown className="w-3 h-3" />;
    return <Minus className="w-3 h-3" />;
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-emerald-400';
    if (trend === 'down') return 'text-rose-400';
    return 'text-slate-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${colorClasses[color]} border backdrop-blur-sm p-5 ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
          <p className="text-2xl md:text-3xl font-bold text-white mb-1">{value}</p>
          {subtitle && (
            <p className="text-slate-500 text-xs">{subtitle}</p>
          )}
          {trendValue && (
            <div className={`flex items-center gap-1 mt-2 text-xs ${getTrendColor()}`}>
              {getTrendIcon()}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </motion.div>
  );
}