import { Star } from "lucide-react";
import { motion } from "framer-motion";

interface Testimonial {
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar: string;
}

const testimonials: Testimonial[] = [
  {
    name: "Sarah Johnson",
    role: "Dermatology Patient",
    content: "SkinGuard AI has been a game-changer for monitoring my moles. The 94% accuracy gives me peace of mind, and I can track changes over time without frequent dermatologist visits.",
    rating: 5,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
  },
  {
    name: "Dr. Michael Chen",
    role: "Dermatologist",
    content: "While not a replacement for professional diagnosis, SkinGuard AI is an excellent tool for patient education and early detection support. My patients love the ABCDE analysis feature.",
    rating: 5,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael"
  },
  {
    name: "Emma Rodriguez",
    role: "Health Conscious User",
    content: "The interface is so intuitive! I appreciate that I can monitor my skin health from home. The alerts for suspicious changes are really helpful.",
    rating: 5,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma"
  },
  {
    name: "James Wilson",
    role: "Tech Enthusiast",
    content: "The AI technology behind SkinGuard is impressive. The accuracy and speed of analysis is remarkable. Definitely worth the investment in my health.",
    rating: 5,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James"
  },
  {
    name: "Lisa Anderson",
    role: "Melanoma Survivor",
    content: "As someone who had melanoma, early detection is critical. SkinGuard AI gives me confidence in monitoring my skin regularly. Highly recommended!",
    rating: 5,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa"
  },
  {
    name: "David Park",
    role: "Regular User",
    content: "Simple, effective, and affordable. I've been using SkinGuard for 6 months and haven't looked back. Great customer support too!",
    rating: 5,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David"
  }
];

export default function Testimonials() {
  return (
    <div className="container py-16">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
          What Users Say About SkinGuard AI
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Join thousands of users who trust SkinGuard AI for their skin health monitoring
        </p>
      </motion.div>

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {testimonials.map((testimonial, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card rounded-xl border border-border/60 p-6 flex flex-col"
          >
            {/* Stars */}
            <div className="flex gap-1 mb-4">
              {Array.from({ length: testimonial.rating }).map((_, j) => (
                <Star
                  key={j}
                  className="w-4 h-4 fill-primary text-primary"
                />
              ))}
            </div>

            {/* Content */}
            <p className="text-sm text-muted-foreground mb-6 flex-1 leading-relaxed">
              "{testimonial.content}"
            </p>

            {/* User Info */}
            <div className="flex items-center gap-3 pt-4 border-t border-border/40">
              <img
                src={testimonial.avatar}
                alt={testimonial.name}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="font-semibold text-sm">{testimonial.name}</p>
                <p className="text-xs text-muted-foreground">{testimonial.role}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Stats Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl border border-primary/20 p-8 md:p-12"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <p className="font-heading text-3xl md:text-4xl font-bold text-primary mb-2">
              10,000+
            </p>
            <p className="text-muted-foreground">Active Users</p>
          </div>
          <div>
            <p className="font-heading text-3xl md:text-4xl font-bold text-primary mb-2">
              94%
            </p>
            <p className="text-muted-foreground">AI Accuracy</p>
          </div>
          <div>
            <p className="font-heading text-3xl md:text-4xl font-bold text-primary mb-2">
              4.9/5
            </p>
            <p className="text-muted-foreground">Average Rating</p>
          </div>
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="text-center mt-16"
      >
        <h2 className="font-heading text-2xl md:text-3xl font-bold mb-4">
          Ready to Join Our Community?
        </h2>
        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
          Start monitoring your skin health today with SkinGuard AI. Your first month is free!
        </p>
        <a href="/pricing" className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
          Get Started Free
        </a>
      </motion.div>
    </div>
  );
}
