'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickGiveInputProps {
  workerId: string;
  className?: string;
}

export function QuickGiveInput({ workerId, className }: QuickGiveInputProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [amount, setAmount] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Show the CTA if focused OR if there's an amount entered
  const isExpanded = isFocused || amount.length > 0;
  const hasValidAmount = amount.length > 0 && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (!amount) {
          setIsFocused(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [amount]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and up to 2 decimal places
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      setAmount(value);
    }
  };

  const handleGive = () => {
    if (hasValidAmount) {
      router.push(`/checkout?workerId=${workerId}&amount=${amount}`);
    } else {
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleGive();
    }
  };

  return (
    <motion.div
      ref={containerRef}
      className={cn(
        "relative h-12 rounded-2xl overflow-hidden cursor-text",
        "bg-slate-900 shadow-xl shadow-slate-900/20",
        "ring-1 ring-white/10",
        "transition-all duration-500",
        isFocused && "ring-white/25 shadow-2xl shadow-slate-900/40",
        className
      )}
      onClick={() => inputRef.current?.focus()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      layout
    >
      <div className="relative h-full w-full flex items-center justify-between">
          <div className="flex items-center h-full flex-1 px-4 min-w-0">
            <motion.span 
              layout
              className={cn(
                "text-base font-semibold mr-1.5 transition-colors duration-300",
                isExpanded ? "text-white" : "text-white/70"
              )}
            >
              $
            </motion.span>
            
            <input
              ref={inputRef}
              type="text"
              inputMode="decimal"
              placeholder={isFocused ? "" : "Give"}
              value={amount}
              onChange={handleAmountChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => {
                if (!amount) setIsFocused(false);
              }}
              onKeyDown={handleKeyDown}
              className={cn(
                "bg-transparent border-none outline-none w-full",
                "text-base font-semibold text-white",
                "placeholder:text-white/70 placeholder:font-semibold",
                "selection:bg-white/30"
              )}
              aria-label="Donation amount"
            />
          </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.button
              initial={{ width: 0, x: 20, opacity: 0 }}
              animate={{ width: "auto", x: 0, opacity: 1 }}
              exit={{ width: 0, x: 20, opacity: 0 }}
              transition={{ 
                type: "spring",
                stiffness: 400,
                damping: 30,
                opacity: { duration: 0.2 }
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleGive();
              }}
              className={cn(
                "h-full px-5 flex items-center gap-2",
                "text-sm font-black uppercase tracking-widest whitespace-nowrap",
                "transition-colors duration-300",
                hasValidAmount 
                  ? "bg-white text-slate-900 hover:bg-slate-50" 
                  : "bg-white/10 text-white/30 cursor-not-allowed"
              )}
            >
              <span className="relative z-10">Give</span>
              <motion.div
                animate={{ x: hasValidAmount && isHovered ? 3 : 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <ArrowRight className="h-4 w-4 stroke-[3]" />
              </motion.div>
            </motion.button>
          )}
        </AnimatePresence>
        
          {!isExpanded && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute right-4 pointer-events-none"
            >
              <ArrowRight className="h-4 w-4 text-white/50 stroke-[2.5]" />
            </motion.div>
          )}
      </div>
    </motion.div>
  );
}
