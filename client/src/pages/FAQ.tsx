import { ChevronDown, Search } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface FAQItem {
  category: string;
  categoryKey: string;
  questions: Array<{ qKey: string; aKey: string }>;
}

// Static structure – questions/answers come from translations via t()
const FAQ_STRUCTURE: FAQItem[] = [
  {
    category: "Getting Started",
    categoryKey: "faq.gettingStarted",
    questions: [
      { qKey: "faq.gs_q1", aKey: "faq.gs_a1" },
      { qKey: "faq.gs_q2", aKey: "faq.gs_a2" },
      { qKey: "faq.gs_q3", aKey: "faq.gs_a3" },
      { qKey: "faq.gs_q4", aKey: "faq.gs_a4" },
    ],
  },
  {
    category: "Features & Accuracy",
    categoryKey: "faq.featuresAccuracy",
    questions: [
      { qKey: "faq.fa_q1", aKey: "faq.fa_a1" },
      { qKey: "faq.fa_q2", aKey: "faq.fa_a2" },
      { qKey: "faq.fa_q3", aKey: "faq.fa_a3" },
      { qKey: "faq.fa_q4", aKey: "faq.fa_a4" },
    ],
  },
  {
    category: "Privacy & Security",
    categoryKey: "faq.privacySecurity",
    questions: [
      { qKey: "faq.ps_q1", aKey: "faq.ps_a1" },
      { qKey: "faq.ps_q2", aKey: "faq.ps_a2" },
      { qKey: "faq.ps_q3", aKey: "faq.ps_a3" },
      { qKey: "faq.ps_q4", aKey: "faq.ps_a4" },
    ],
  },
  {
    category: "Subscriptions & Billing",
    categoryKey: "faq.subscriptionsBilling",
    questions: [
      { qKey: "faq.sb_q1", aKey: "faq.sb_a1" },
      { qKey: "faq.sb_q2", aKey: "faq.sb_a2" },
      { qKey: "faq.sb_q3", aKey: "faq.sb_a3" },
      { qKey: "faq.sb_q4", aKey: "faq.sb_a4" },
    ],
  },
  {
    category: "Melanoma & Skin Health",
    categoryKey: "faq.melanomaSkinHealth",
    questions: [
      { qKey: "faq.ms_q1", aKey: "faq.ms_a1" },
      { qKey: "faq.ms_q2", aKey: "faq.ms_a2" },
      { qKey: "faq.ms_q3", aKey: "faq.ms_a3" },
      { qKey: "faq.ms_q4", aKey: "faq.ms_a4" },
    ],
  },
  {
    category: "Technical Support",
    categoryKey: "faq.technicalSupport",
    questions: [
      { qKey: "faq.ts_q1", aKey: "faq.ts_a1" },
      { qKey: "faq.ts_q2", aKey: "faq.ts_a2" },
      { qKey: "faq.ts_q3", aKey: "faq.ts_a3" },
      { qKey: "faq.ts_q4", aKey: "faq.ts_a4" },
    ],
  },
];

export default function FAQ() {
  const { t } = useLanguage();
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");

  const toggleItem = (id: string) => {
    const newOpen = new Set(openItems);
    if (newOpen.has(id)) {
      newOpen.delete(id);
    } else {
      newOpen.add(id);
    }
    setOpenItems(newOpen);
  };

  // Build translated FAQ data for filtering
  const translatedFAQ = FAQ_STRUCTURE.map(cat => ({
    ...cat,
    questions: cat.questions.map(q => ({
      ...q,
      q: t(q.qKey),
      a: t(q.aKey),
    })),
  }));

  const filteredFAQ = translatedFAQ
    .map(category => ({
      ...category,
      questions: category.questions.filter(
        q =>
          q.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.a.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter(category => category.questions.length > 0);

  return (
    <div className="container py-16">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
          {t('faq.title')}
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
          {t('faq.subtitle')}
        </p>

        {/* Search */}
        <div className="max-w-md mx-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder={t('faq.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border/60 bg-card focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </motion.div>

      {/* FAQ Sections */}
      <div className="max-w-3xl mx-auto space-y-8">
        {filteredFAQ.map((category, catIndex) => (
          <motion.div
            key={category.category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: catIndex * 0.1 }}
          >
            <h2 className="font-heading text-2xl font-bold mb-4 text-primary">
              {t(category.categoryKey)}
            </h2>

            <div className="space-y-3">
              {category.questions.map((item, qIndex) => {
                const itemId = `${category.category}-${qIndex}`;
                const isOpen = openItems.has(itemId);

                return (
                  <motion.div
                    key={itemId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: qIndex * 0.05 }}
                    className="bg-card rounded-lg border border-border/60 overflow-hidden"
                  >
                    <button
                      onClick={() => toggleItem(itemId)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-card/80 transition-colors"
                    >
                      <span className="font-semibold text-sm pr-4">{item.q}</span>
                      <ChevronDown
                        className={`w-5 h-5 shrink-0 text-primary transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-4 pb-4 border-t border-border/40"
                      >
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {item.a}
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ))}

        {filteredFAQ.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-muted-foreground mb-4">
              {t('faq.noResults')}
            </p>
            <button
              onClick={() => setSearchTerm("")}
              className="text-primary hover:underline"
            >
              {t('faq.clearSearch')}
            </button>
          </motion.div>
        )}
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-center mt-16"
      >
        <h2 className="font-heading text-2xl font-bold mb-4">{t('faq.ctaTitle')}</h2>
        <p className="text-muted-foreground mb-6">
          {t('faq.ctaSubtitle')}
        </p>
        <a
          href="/contact"
          className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
        >
          {t('faq.ctaBtn')}
        </a>
      </motion.div>
    </div>
  );
}
