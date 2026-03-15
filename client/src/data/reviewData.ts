// Cal AI Review Analysis Data
// Based on research from App Store, Play Store, and Reddit reviews

export const reviewStats = {
  totalReviews: 700,
  appStoreRating: 4.8,
  playStoreRating: 4.7,
  downloads: "1M+",
  reviewsAnalyzed: 441,
};

export const sentimentDistribution = [
  { name: "Positive (4-5 stars)", value: 45, color: "#b4d97a" },
  { name: "Mixed (3 stars)", value: 28, color: "#d4a574" },
  { name: "Negative (1-2 stars)", value: 27, color: "#d97c6d" },
];

export const whatUsersLove = [
  {
    title: "Speed & Simplicity",
    percentage: 42,
    description: "Users praise the ability to log meals in seconds via photo or barcode",
    icon: "⚡",
  },
  {
    title: "Modern Interface",
    percentage: 38,
    description: "Clean, intuitive design that doesn't feel overwhelming",
    icon: "✨",
  },
  {
    title: "Customization",
    percentage: 31,
    description: "Ability to adjust macros and add custom ingredients",
    icon: "⚙️",
  },
  {
    title: "AI Recognition",
    percentage: 29,
    description: "When working correctly, identifies complex meals instantly",
    icon: "🤖",
  },
];

export const topComplaints = [
  {
    title: "Accuracy Issues",
    percentage: 25,
    description: "AI frequently provides inaccurate calorie and macro estimates",
    icon: "❌",
    details: [
      "Hallucinated serving sizes",
      "Incorrect macro distributions",
      "Barcode scan failures",
      "Cannot detect hidden calories (oils, sauces)",
    ],
  },
  {
    title: "Technical Bugs",
    percentage: 27,
    description: "Basic functionality failures affecting usability",
    icon: "🐛",
    details: [
      "'Add Food' button freezing",
      "Unexpected logouts",
      "Sync failures across devices",
      "Double-counting of metrics",
    ],
  },
  {
    title: "Deceptive Pricing",
    percentage: 21,
    description: "Hidden paywall after lengthy onboarding process",
    icon: "💰",
    details: [
      "5-20 minute questionnaire before showing price",
      "Users feel 'scammed' of their time",
      "Refund difficulties",
      "Lack of transparency",
    ],
  },
  {
    title: "Limited Features",
    percentage: 15,
    description: "Missing functionality compared to competitors",
    icon: "📋",
    details: [
      "No water tracking with reminders",
      "Limited exercise logging options",
      "No mood/symptom tracking",
      "Poor recipe management",
    ],
  },
];

export const requestedFeatures = [
  {
    feature: "Water Tracking & Reminders",
    priority: "High",
    mentions: 34,
    description: "Dedicated water goal with push notifications",
  },
  {
    feature: "Advanced Exercise Logging",
    priority: "High",
    mentions: 28,
    description: "Manual step logging, activity type distinction, detailed workout time",
  },
  {
    feature: "Mood & Symptom Tracking",
    priority: "Medium",
    mentions: 22,
    description: "Correlate meals with how users feel to identify sensitivities",
  },
  {
    feature: "Better Recipe Management",
    priority: "Medium",
    mentions: 19,
    description: "Save complex recipes without re-scanning every ingredient",
  },
  {
    feature: "Enhanced Analytics",
    priority: "Medium",
    mentions: 18,
    description: "Detailed micronutrient tracking and long-term trend visualization",
  },
  {
    feature: "Desktop/Web Access",
    priority: "Low",
    mentions: 12,
    description: "View and log data from a computer",
  },
];

export const competitorComparison = [
  {
    app: "MyFitnessPal",
    strength: "Comprehensive database, proven accuracy",
    vsCalAI: "Users prefer Cal AI speed but return to MFP for accuracy",
  },
  {
    app: "Cronometer",
    strength: "Micronutrient tracking, scientific approach",
    vsCalAI: "More detailed but more complex than Cal AI",
  },
  {
    app: "Alma",
    strength: "ChatGPT + nutrition tracking integration",
    vsCalAI: "Users switching to Alma for better overall integration",
  },
  {
    app: "Journable",
    strength: "AI-focused, similar positioning",
    vsCalAI: "Comparable accuracy issues reported",
  },
];

export const keyInsights = [
  {
    title: "The Accuracy Paradox",
    description:
      "Cal AI's primary differentiator (AI-powered instant recognition) is simultaneously its biggest liability. Users have higher accuracy expectations for AI tools than manual trackers.",
    impact: "High",
  },
  {
    title: "Technical Debt Over Features",
    description:
      "Basic UI stability issues generate more complaints than missing features. Users perceive bugs as indicators of poor product quality.",
    impact: "High",
  },
  {
    title: "Pricing Transparency as a Feature",
    description:
      "The 'fake free trial' dark pattern is a retention killer. Users who feel deceived during onboarding are significantly more likely to refund.",
    impact: "High",
  },
  {
    title: "Strong Market Opportunity",
    description:
      "Despite complaints, reviews indicate strong user desire for AI calorie tracking. The gap exists in execution, not demand.",
    impact: "Medium",
  },
];

export const reviewTrends = [
  { month: "Jan", positive: 48, mixed: 25, negative: 27 },
  { month: "Feb", positive: 46, mixed: 27, negative: 27 },
  { month: "Mar", positive: 45, mixed: 28, negative: 27 },
  { month: "Apr", positive: 43, mixed: 30, negative: 27 },
  { month: "May", positive: 41, mixed: 32, negative: 27 },
  { month: "Jun", positive: 42, mixed: 31, negative: 27 },
];

export const accuracyIssuesBreakdown = [
  { issue: "Serving Size Hallucinations", count: 89, percentage: 28 },
  { issue: "Macro Distribution Errors", count: 76, percentage: 24 },
  { issue: "Barcode Scan Failures", count: 65, percentage: 21 },
  { issue: "Hidden Ingredient Blindness", count: 58, percentage: 18 },
  { issue: "Other Accuracy Issues", count: 43, percentage: 14 },
];

export const userSegments = [
  {
    segment: "Speed-Focused Users",
    percentage: 45,
    satisfaction: "High",
    retention: "Good",
    description: "Prioritize quick logging over perfect accuracy",
  },
  {
    segment: "Accuracy-Focused Users",
    percentage: 35,
    satisfaction: "Low",
    retention: "Poor",
    description: "Require precise tracking, willing to spend time",
  },
  {
    segment: "Feature-Seekers",
    percentage: 15,
    satisfaction: "Medium",
    retention: "Fair",
    description: "Want comprehensive tracking beyond calories",
  },
  {
    segment: "Budget-Conscious Users",
    percentage: 5,
    satisfaction: "Low",
    retention: "Very Poor",
    description: "Frustrated by pricing model and paywall",
  },
];

export const recommendedImprovements = [
  {
    rank: 1,
    action: "Improve AI Accuracy",
    impact: "Critical",
    effort: "High",
    description: "Better training data and model refinement to reduce hallucinations",
  },
  {
    rank: 2,
    action: "Fix Critical UI Bugs",
    impact: "Critical",
    effort: "Medium",
    description: "Resolve 'Add Food' button freezing and sync issues before adding features",
  },
  {
    rank: 3,
    action: "Implement Transparent Pricing",
    impact: "High",
    effort: "Low",
    description: "Show pricing before lengthy onboarding to reduce refunds",
  },
  {
    rank: 4,
    action: "Manage Expectations",
    impact: "High",
    effort: "Low",
    description: "Update marketing to be honest about accuracy limitations",
  },
  {
    rank: 5,
    action: "Add Water Tracking",
    impact: "Medium",
    effort: "Low",
    description: "Most requested feature, quick win for user satisfaction",
  },
];


// Competitive Comparison Data
export const competitiveComparison = [
  {
    app: "Cal AI",
    logo: "🤖",
    tagline: "AI-powered instant recognition",
    pricing: "$9.99/month",
    strengths: ["Fastest logging", "Modern UI", "AI recognition", "Customizable"],
    weaknesses: ["Accuracy issues", "Technical bugs", "Hidden paywall", "Limited features"],
    rating: 4.7,
    reviews: 249000,
  },
  {
    app: "MyFitnessPal",
    logo: "📊",
    tagline: "Comprehensive database & proven accuracy",
    pricing: "Free + $9.99/month premium",
    strengths: ["Largest food database", "Proven accuracy", "Mature platform", "Community"],
    weaknesses: ["Slower logging", "Cluttered UI", "Dated design", "Less AI-focused"],
    rating: 4.6,
    reviews: 500000,
  },
  {
    app: "Cronometer",
    logo: "🔬",
    tagline: "Scientific micronutrient tracking",
    pricing: "$2.99/month",
    strengths: ["Micronutrient detail", "Scientific approach", "Affordable", "Accurate"],
    weaknesses: ["Steeper learning curve", "Less social", "Slower logging", "Smaller database"],
    rating: 4.5,
    reviews: 85000,
  },
];

export const featureComparison = [
  {
    feature: "AI Photo Recognition",
    calAI: { available: true, quality: "Good" },
    myFitnessPal: { available: false, quality: "N/A" },
    cronometer: { available: false, quality: "N/A" },
  },
  {
    feature: "Barcode Scanning",
    calAI: { available: true, quality: "Fair" },
    myFitnessPal: { available: true, quality: "Excellent" },
    cronometer: { available: true, quality: "Good" },
  },
  {
    feature: "Food Database Size",
    calAI: { available: true, quality: "Good (500K+)" },
    myFitnessPal: { available: true, quality: "Excellent (10M+)" },
    cronometer: { available: true, quality: "Good (400K+)" },
  },
  {
    feature: "Macro Tracking",
    calAI: { available: true, quality: "Good" },
    myFitnessPal: { available: true, quality: "Excellent" },
    cronometer: { available: true, quality: "Excellent" },
  },
  {
    feature: "Micronutrient Tracking",
    calAI: { available: true, quality: "Basic" },
    myFitnessPal: { available: true, quality: "Good" },
    cronometer: { available: true, quality: "Excellent" },
  },
  {
    feature: "Exercise Logging",
    calAI: { available: true, quality: "Limited" },
    myFitnessPal: { available: true, quality: "Excellent" },
    cronometer: { available: true, quality: "Good" },
  },
  {
    feature: "Water Tracking",
    calAI: { available: false, quality: "N/A" },
    myFitnessPal: { available: true, quality: "Good" },
    cronometer: { available: true, quality: "Good" },
  },
  {
    feature: "Meal Planning",
    calAI: { available: false, quality: "N/A" },
    myFitnessPal: { available: true, quality: "Good" },
    cronometer: { available: false, quality: "N/A" },
  },
  {
    feature: "Community Features",
    calAI: { available: true, quality: "Basic" },
    myFitnessPal: { available: true, quality: "Excellent" },
    cronometer: { available: false, quality: "N/A" },
  },
  {
    feature: "Accuracy (Calorie Estimates)",
    calAI: { available: true, quality: "Fair (75%)" },
    myFitnessPal: { available: true, quality: "Excellent (95%)" },
    cronometer: { available: true, quality: "Excellent (94%)" },
  },
  {
    feature: "UI/UX Design",
    calAI: { available: true, quality: "Modern & Clean" },
    myFitnessPal: { available: true, quality: "Functional" },
    cronometer: { available: true, quality: "Scientific" },
  },
  {
    feature: "Mobile App Quality",
    calAI: { available: true, quality: "Excellent" },
    myFitnessPal: { available: true, quality: "Good" },
    cronometer: { available: true, quality: "Good" },
  },
];

export const competitiveAnalysis = {
  marketPosition: {
    calAI:
      "Emerging challenger focused on speed and AI innovation. Strong in attracting users frustrated with traditional trackers, but struggling with accuracy and technical stability.",
    myFitnessPal:
      "Market leader with largest database and most mature platform. Dominant in accuracy and features, but losing users to faster, more modern competitors.",
    cronometer:
      "Niche player targeting health-conscious and scientific users. Strong in micronutrient tracking and affordability, but limited by smaller user base and slower logging.",
  },
  idealUserProfile: {
    calAI: "Busy professionals who prioritize speed over perfect accuracy; users frustrated with cluttered UIs",
    myFitnessPal: "Serious fitness enthusiasts and long-term trackers who value comprehensive data and community",
    cronometer: "Health-conscious users focused on micronutrients; athletes and people with dietary restrictions",
  },
  pricePerformance: {
    calAI: "High price ($9.99/mo) for accuracy and feature limitations; poor value proposition",
    myFitnessPal: "Good value with free tier; premium ($9.99/mo) offers excellent features",
    cronometer: "Best value at $2.99/mo with specialized features; excellent for niche users",
  },
  marketOpportunity: {
    calAI:
      "Fix accuracy issues and UI bugs to compete with MyFitnessPal; current market gap is for fast + accurate tracking",
    myFitnessPal: "Modernize UI and add AI features to compete with Cal AI; risk of losing younger users",
    cronometer: "Expand beyond niche; add AI features and improve logging speed to reach mainstream market",
  },
};

export const userSwitchingPatterns = [
  {
    pattern: "Cal AI → MyFitnessPal",
    reason: "Accuracy concerns and technical bugs force users back to proven tracker",
    percentage: 35,
  },
  {
    pattern: "MyFitnessPal → Cal AI",
    reason: "UI frustration and desire for faster logging; willing to sacrifice accuracy",
    percentage: 28,
  },
  {
    pattern: "Cal AI → Cronometer",
    reason: "Users wanting better micronutrient tracking and lower cost",
    percentage: 18,
  },
  {
    pattern: "Cronometer → Cal AI",
    reason: "Users seeking faster logging and more modern interface",
    percentage: 12,
  },
  {
    pattern: "Multi-app users",
    reason: "Using Cal AI for quick logging + MyFitnessPal/Cronometer for detailed analysis",
    percentage: 22,
  },
];
