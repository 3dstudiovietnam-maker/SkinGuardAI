/**
 * Legal Notice & Terms of Service
 * IP Protection, Copyright, Medical Disclaimer
 */

export default function Legal() {
  return (
    <div className="min-h-screen bg-white py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 mb-8">Legal Notice & Terms of Service</h1>

        {/* Copyright & IP */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Intellectual Property Rights</h2>
          <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 space-y-4">
            <p className="text-slate-700">
              <strong>Copyright &copy; {new Date().getFullYear()} SkinGuard AI</strong>
            </p>
            <p className="text-slate-700">
              <strong>Intellectual Property Owner:</strong> Attila Koch / Visa Line Inc.
            </p>
            <p className="text-slate-700">
              <strong>Address:</strong> 16192 Coastal Highway, Lewes, Delaware 19958, USA
            </p>
            <p className="text-slate-700">
              All rights reserved. The SkinGuard AI application, including its design, code, algorithms, artificial intelligence models, user interface, and all associated intellectual property, is the exclusive property of Attila Koch and Visa Line Inc.
            </p>
          </div>
        </section>

        {/* Prohibited Activities */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Intellectual Property Protection</h2>
          <div className="space-y-4 text-slate-700">
            <p>
              You may not, without express written permission from Visa Line Inc.:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Reproduce, duplicate, copy, or reuse any portion of the application or its code</li>
              <li>Reverse engineer, decompile, or attempt to derive the source code or algorithms</li>
              <li>Modify, adapt, translate, or create derivative works based on the application</li>
              <li>Distribute, sell, lease, or sublicense the application or any component thereof</li>
              <li>Remove or alter any copyright, trademark, or proprietary notices</li>
              <li>Use the AI models or algorithms for commercial purposes without authorization</li>
              <li>Scrape, crawl, or extract data from the application for unauthorized use</li>
            </ul>
          </div>
        </section>

        {/* Medical Disclaimer */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Medical Disclaimer</h2>
          <div className="bg-red-50 p-6 rounded-lg border border-red-200 space-y-4">
            <p className="text-red-900 font-semibold">
              ⚠️ IMPORTANT: SkinGuard AI is NOT a medical diagnostic tool and should NOT be used as a substitute for professional medical advice, diagnosis, or treatment.
            </p>
            <p className="text-slate-700">
              SkinGuard AI is designed as a personal skin health monitoring and tracking tool only. The AI analysis provided by this application:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 text-slate-700">
              <li>Is based on machine learning models trained on dermatological data</li>
              <li>Should NOT be relied upon for medical diagnosis or treatment decisions</li>
              <li>Is NOT a replacement for professional dermatological evaluation</li>
              <li>May contain inaccuracies or errors</li>
              <li>Is intended only to help you track changes and remind you to consult a healthcare professional</li>
            </ul>
            <p className="text-slate-700 font-semibold mt-4">
              Always consult a qualified dermatologist or healthcare professional for any skin concerns, suspicious changes, or medical advice. If you suspect skin cancer or any serious skin condition, seek immediate professional medical attention.
            </p>
          </div>
        </section>

        {/* Data Privacy */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Data Privacy & Security</h2>
          <div className="space-y-4 text-slate-700">
            <p>
              SkinGuard AI respects your privacy. Your skin photos and personal health data are:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Stored securely on your device (local storage) by default</li>
              <li>Never shared with third parties without your explicit consent</li>
              <li>Protected with industry-standard encryption</li>
              <li>Not used for any purpose other than your personal skin health monitoring</li>
            </ul>
            <p className="mt-4">
              For detailed information about how we handle your data, please review our Privacy Policy.
            </p>
          </div>
        </section>

        {/* Limitation of Liability */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Limitation of Liability</h2>
          <div className="space-y-4 text-slate-700">
            <p>
              To the maximum extent permitted by law, Visa Line Inc. and Attila Koch shall not be liable for:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Any indirect, incidental, special, or consequential damages</li>
              <li>Loss of data, revenue, or business opportunities</li>
              <li>Medical complications or health issues arising from use of the application</li>
              <li>Inaccuracies in AI analysis or recommendations</li>
              <li>Interruption or unavailability of the service</li>
            </ul>
            <p className="mt-4">
              Your use of SkinGuard AI is at your own risk. You assume full responsibility for any decisions made based on the application's analysis.
            </p>
          </div>
        </section>

        {/* Acceptable Use */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Acceptable Use Policy</h2>
          <div className="space-y-4 text-slate-700">
            <p>
              You agree not to use SkinGuard AI for:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Any illegal or unauthorized purpose</li>
              <li>Harassing, abusing, or threatening other users</li>
              <li>Uploading malicious code or viruses</li>
              <li>Attempting to gain unauthorized access to the application or servers</li>
              <li>Interfering with the normal operation of the service</li>
              <li>Collecting or tracking personal information of others without consent</li>
            </ul>
          </div>
        </section>

        {/* Contact */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Contact Information</h2>
          <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 space-y-2">
            <p className="text-slate-700">
              <strong>For legal inquiries, IP protection concerns, or other matters:</strong>
            </p>
            <p className="text-slate-700">
              Visa Line Inc.<br />
              16192 Coastal Highway<br />
              Lewes, Delaware 19958, USA
            </p>
            <p className="text-slate-700">
              Contact: Attila Koch
            </p>
          </div>
        </section>

        {/* Last Updated */}
        <div className="text-center text-sm text-slate-500 pt-8 border-t border-slate-200">
          <p>Last Updated: {new Date().toLocaleDateString()}</p>
          <p>These terms are subject to change without notice.</p>
        </div>
      </div>
    </div>
  );
}
