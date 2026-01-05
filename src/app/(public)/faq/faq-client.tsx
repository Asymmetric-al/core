'use client';

import React, { useState, useMemo } from 'react';
import { 
  Plus, Minus, HelpCircle, Search, 
  DollarSign, Users, ShieldCheck, Heart, 
  Mail, MessageCircle, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type Category = 'General' | 'Financials' | 'Donations' | 'Partners' | 'Account';

interface FAQItem {
  question: string;
  answer: React.ReactNode;
  category: Category;
  popular?: boolean;
}

const FAQ_DATA: FAQItem[] = [
  {
    category: 'Financials',
    question: "How much of my donation actually goes to the field?",
    answer: "We are committed to radical efficiency. **85%** of all expenses go directly to program services and field partners. 10% is allocated to fundraising to sustain our growth, and 5% covers necessary administrative overhead. We believe you should know exactly where your money goes.",
    popular: true
  },
  {
    category: 'Financials',
    question: "How do you ensure financial accountability?",
    answer: "We employ a rigorous multi-step accountability process. This includes annual independent audits, quarterly field reports from partners, and randomized site visits. Our transparency portal allows donors to see exactly how funds are deployed.",
    popular: true
  },
  {
    category: 'Financials',
    question: "Are my donations tax-deductible?",
    answer: "Yes. GiveHope is a registered 501(c)(3) nonprofit organization in the United States. All donations are tax-deductible to the full extent allowed by law. You will receive an instant email receipt for every gift and a consolidated annual statement in January."
  },
  {
    category: 'Donations',
    question: "Can I designate my gift to a specific project?",
    answer: "Absolutely. You have full control. You can choose to support a specific field worker, a regional fund (e.g., East Africa), or a thematic fund (e.g., Clean Water). Undesignated gifts go to the 'Where Needed Most' fund, which allows us to respond rapidly to emergencies.",
    popular: true
  },
  {
    category: 'Donations',
    question: "Do you accept stock or cryptocurrency?",
    answer: "Yes, we accept donations of appreciated stock, mutual funds, and major cryptocurrencies (Bitcoin, Ethereum, USDC). These giving methods can often provide significant tax advantages. Please visit our 'Ways to Give' page for transfer instructions."
  },
  {
    category: 'Donations',
    question: "Can I set up a recurring monthly donation?",
    answer: "Yes! Monthly partners are the backbone of our mission. You can set up a recurring gift using a credit card or bank transfer (ACH). ACH is preferred as it lowers processing fees, meaning more of your gift reaches the field."
  },
  {
    category: 'Donations',
    question: "What happens if a project is fully funded?",
    answer: "In the rare event that a specific project receives more funds than needed, we will redirect the surplus to a similar project in the same region or sector (e.g., another clean water project) to ensure your intent is honored."
  },
  {
    category: 'Partners',
    question: "How do you vet your field partners?",
    answer: "We take vetting seriously. Our 5-step process includes: 1) Initial application and background checks, 2) Theological and ethical alignment review, 3) Financial history audit, 4) Peer references from other NGOs, and 5) An on-site visit by our Director of Field Operations.",
    popular: true
  },
  {
    category: 'Partners',
    question: "Do field workers receive 100% of the funds raised for them?",
    answer: "When you give to a specific worker, 100% of the net donation (after credit card processing fees) is granted to their project account. We cover our own HQ operational costs through a separate general fund and specific 'overhead' donations."
  },
  {
    category: 'Partners',
    question: "Can I communicate directly with the people I support?",
    answer: "Yes! Our platform enables secure messaging. You can send notes of encouragement directly through the Donor Portal. For safety and privacy reasons, we moderate these messages and do not share direct personal contact information."
  },
  {
    category: 'Account',
    question: "How do I update my credit card information?",
    answer: "Log in to the Donor Portal and navigate to the 'Wallet' section. From there, you can add a new payment method and update your active pledges to use the new card.",
  },
  {
    category: 'Account',
    question: "Where can I find my year-end tax statement?",
    answer: "Your annual giving statement is available for download in the 'History' tab of the Donor Portal by January 31st of the following year. We also email a copy to the address on file.",
  },
  {
    category: 'Account',
    question: "How do I cancel my monthly pledge?",
    answer: "We make it easy. You can pause or cancel your recurring gift at any time directly from the 'Pledges' tab in your Donor Portal. No need to call us, though we'd love to know if there's anything we can do to help.",
  }
];

const CategoryButton = ({ 
  active, 
  onClick, 
  label, 
  icon: Icon 
}: { 
  active: boolean; 
  onClick: () => void; 
  label: string; 
  icon: any; 
}) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 border",
      active 
        ? "bg-slate-900 text-white border-slate-900 shadow-md transform scale-[1.02]" 
        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
    )}
  >
    <Icon className={cn("w-4 h-4", active ? "text-emerald-400" : "text-slate-400")} />
    {label}
  </button>
);

const AccordionItem = ({ item, isOpen, onClick }: { item: FAQItem, isOpen: boolean, onClick: () => void }) => {
  return (
    <motion.div 
      initial={false}
      className={cn(
        "border rounded-2xl overflow-hidden transition-all duration-300",
        isOpen ? "border-blue-200 bg-blue-50/30 shadow-sm" : "border-slate-200 bg-white hover:border-slate-300"
      )}
    >
      <button 
        onClick={onClick}
        className="w-full flex items-start justify-between p-6 text-left focus:outline-none group"
      >
        <div className="flex gap-4">
          <div className={cn(
            "mt-1 w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors",
            isOpen ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
          )}>
            {isOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          </div>
          <span className={cn(
            "text-lg font-bold transition-colors",
            isOpen ? "text-blue-900" : "text-slate-900 group-hover:text-slate-700"
          )}>
            {item.question}
          </span>
        </div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="px-6 pb-6 pl-[3.5rem] pr-8 text-slate-600 leading-relaxed font-light">
              {typeof item.answer === 'string' ? (
                <p>
                  {item.answer.split('**').map((part, i) => 
                    i % 2 === 1 ? <strong key={i} className="font-semibold text-slate-800">{part}</strong> : part
                  )}
                </p>
              ) : item.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export function FAQPageClient() {
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filteredData = useMemo<FAQItem[]>(() => {
    return FAQ_DATA.filter(item => {
      const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (typeof item.answer === 'string' && item.answer.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  return (
    <div className="bg-slate-50 min-h-screen pt-20 pb-32">
      
      <section className="bg-white border-b border-slate-200 pb-16 pt-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-[0.03]">
           <div className="absolute -top-20 -right-20 w-96 h-96 bg-blue-600 rounded-full blur-3xl" />
           <div className="absolute top-40 -left-20 w-72 h-72 bg-emerald-500 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center justify-center p-2 bg-slate-50 border border-slate-200 rounded-2xl mb-6 shadow-sm">
                <div className="bg-white p-2 rounded-xl text-blue-600">
                    <HelpCircle className="h-6 w-6" />
                </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-slate-900 mb-6">
              How can we help?
            </h1>
            <p className="text-xl text-slate-500 font-light mb-10 text-balance">
              Transparency and trust are our currency. Everything you need to know about our mission, financials, and operations.
            </p>

            <div className="relative max-w-lg mx-auto group">
              <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative bg-white rounded-full shadow-xl shadow-slate-200/50 flex items-center p-2 border border-slate-200 group-focus-within:border-blue-400 group-focus-within:ring-4 group-focus-within:ring-blue-100 transition-all duration-300">
                <Search className="ml-4 h-5 w-5 text-slate-400" />
                <Input 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-none shadow-none focus-visible:ring-0 text-base h-12 bg-transparent"
                  placeholder="Search for answers..." 
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="p-2 text-slate-400 hover:text-slate-600">
                    <span className="sr-only">Clear</span>
                    <div className="h-5 w-5 bg-slate-100 rounded-full flex items-center justify-center">×</div>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="container mx-auto px-6 max-w-4xl -mt-8 relative z-20">
        
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <CategoryButton active={activeCategory === 'All'} onClick={() => setActiveCategory('All')} label="All Questions" icon={Sparkles} />
          <CategoryButton active={activeCategory === 'Financials'} onClick={() => setActiveCategory('Financials')} label="Financials" icon={DollarSign} />
          <CategoryButton active={activeCategory === 'Donations'} onClick={() => setActiveCategory('Donations')} label="Donations" icon={Heart} />
          <CategoryButton active={activeCategory === 'Partners'} onClick={() => setActiveCategory('Partners')} label="Partners" icon={Users} />
          <CategoryButton active={activeCategory === 'Account'} onClick={() => setActiveCategory('Account')} label="My Account" icon={ShieldCheck} />
        </div>

        <div className="space-y-4 min-h-[400px]">
          <AnimatePresence mode='wait'>
            {filteredData.length > 0 ? (
              filteredData.map((item, idx) => (
                <AccordionItem 
                  key={`${item.category}-${idx}`} 
                  item={item} 
                  isOpen={openIndex === idx} 
                  onClick={() => setOpenIndex(openIndex === idx ? null : idx)} 
                />
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
                  <Search className="h-8 w-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No results found</h3>
                <p className="text-slate-500">Try adjusting your search terms or browse by category.</p>
                <Button variant="link" onClick={() => { setSearchQuery(''); setActiveCategory('All'); }} className="mt-2 text-blue-600">
                  View all questions
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </section>

      <section className="container mx-auto px-6 mt-24 max-w-5xl">
        <div className="bg-slate-900 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-slate-900/20">
           <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
           <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-600 rounded-full blur-[100px] opacity-50" />
           
           <div className="relative z-10 text-center md:text-left">
              <h2 className="text-3xl font-bold mb-3 tracking-tight">Still have questions?</h2>
              <p className="text-slate-300 text-lg max-w-md font-light leading-relaxed">
                Can&apos;t find the answer you&apos;re looking for? Our Donor Relations team is here to help personally.
              </p>
           </div>

           <div className="flex flex-col sm:flex-row gap-4 relative z-10 w-full md:w-auto">
              <Button className="h-14 px-8 bg-white text-slate-950 hover:bg-slate-100 font-bold text-base rounded-full shadow-lg transition-transform hover:scale-105" asChild>
                 <Link href="/contact">
                    <Mail className="mr-2 h-5 w-5" /> Email Support
                 </Link>
              </Button>
              <Button variant="outline" className="h-14 px-8 border-white/20 text-white hover:bg-white/10 hover:text-white font-semibold text-base rounded-full backdrop-blur-sm transition-transform hover:scale-105">
                 <MessageCircle className="mr-2 h-5 w-5" /> Chat with Us
              </Button>
           </div>
        </div>
      </section>

    </div>
  );
}
