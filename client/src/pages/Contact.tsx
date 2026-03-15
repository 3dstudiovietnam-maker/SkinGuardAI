import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Contact() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate sending email - in production, this would call a backend API
      // For now, we'll just show a success message
      console.log("Form submitted:", formData);
      
      // Create mailto link with form data
      const mailtoLink = `mailto:info@skinguardai.app?subject=Contact from ${encodeURIComponent(formData.name)}&body=${encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`)}`;
      
      // Open default email client
      window.location.href = mailtoLink;
      
      setSubmitted(true);
      setFormData({ name: "", email: "", message: "" });
      
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 md:py-20">
      <div className="container max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            {t('contact.getInTouch')}
          </h1>
          <p className="text-lg text-slate-600">
            {t('contact.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Contact Info Cards */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-full bg-cyan-100 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-cyan-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">{t('contact.generalInquiries')}</h3>
            <a href="mailto:info@skinguardai.app" className="text-cyan-600 hover:text-cyan-700 text-sm">
              info@skinguardai.app
            </a>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">{t('contact.partnerships')}</h3>
            <a href="mailto:partners@skinguardai.app" className="text-teal-600 hover:text-teal-700 text-sm">
              partners@skinguardai.app
            </a>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">{t('contact.location')}</h3>
            <p className="text-slate-600 text-sm">
              {t('contact.global')}
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-xl p-8 border border-slate-200">
          <h2 className="font-heading text-2xl font-bold text-slate-900 mb-6">{t('contact.sendMessage')}</h2>

          {submitted && (
            <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 text-green-700">
              {t('contact.successMsg')}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-900 mb-2">
                {t('contact.nameLabel')}
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="John Doe"
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-900"
              />
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-900 mb-2">
                {t('contact.emailLabel')}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="john@example.com"
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-900"
              />
            </div>

            {/* Message Field */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-slate-900 mb-2">
                {t('contact.messageLabel')}
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                placeholder={t('contact.messagePlaceholder')}
                rows={6}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-900 resize-none"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-medium py-2 rounded-lg transition-colors"
            >
              {loading ? t('contact.sending') : t('contact.sendBtn')}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            {t('contact.responseTime')}
          </p>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-semibold text-slate-900 mb-2">{t('contact.quickResponse')}</h3>
            <p className="text-slate-600 text-sm">
              {t('contact.quickResponseDesc')}
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-2">{t('contact.partnershipOpp')}</h3>
            <p className="text-slate-600 text-sm">
              {t('contact.partnershipDesc')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
