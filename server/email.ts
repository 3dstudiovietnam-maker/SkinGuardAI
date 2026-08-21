import nodemailer from "nodemailer";
import { ENV } from "./_core/env";

// Create transporter - using Gmail SMTP for demo
// For production, use your email service provider (SendGrid, AWS SES, etc.)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: ENV.emailUser || "your-email@gmail.com",
    pass: ENV.emailPassword || "your-app-password",
  },
});

// Canonical public origin for links we put INTO emails.
// These used to be hardcoded to the legacy "skinguardai.manus.space" host, which
// the app no longer serves — so password-reset and e-mail-verification links were
// dead. That is not just a broken feature: if a user cannot log back in, they
// cannot exercise the export/delete rights the Privacy Policy promises them.
// Same pattern (and same default) as the Google OAuth redirect_uri in oauth.ts.
// NOTE: the Microsoft/Twitter redirect_uri values in oauth.ts are deliberately
// left alone — those must match what is registered in each provider's console.
const APP_ORIGIN = process.env.APP_URL || "https://www.skinguardai.app";

// Email templates
const emailTemplates = {
  passwordReset: (resetLink: string, userName: string) => ({
    subject: "Reset Your SkinGuard AI Password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">SkinGuard AI</h1>
        </div>
        <div style="background: #f8fafc; padding: 40px; border-radius: 0 0 8px 8px;">
          <p style="color: #334155; font-size: 16px; margin-bottom: 20px;">Hi ${userName},</p>
          <p style="color: #334155; font-size: 16px; margin-bottom: 30px;">
            We received a request to reset your password. Click the button below to create a new password.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background: #06b6d4; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Reset Password
            </a>
          </div>
          <p style="color: #64748b; font-size: 14px; margin-bottom: 10px;">
            Or copy and paste this link in your browser:
          </p>
          <p style="color: #06b6d4; font-size: 12px; word-break: break-all; margin-bottom: 30px;">
            ${resetLink}
          </p>
          <p style="color: #64748b; font-size: 14px; margin-bottom: 10px;">
            This link will expire in 1 hour.
          </p>
          <p style="color: #64748b; font-size: 14px; margin-bottom: 20px;">
            If you didn't request this, you can ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">
            © 2026 SkinGuard AI. All rights reserved.
          </p>
        </div>
      </div>
    `,
  }),

  emailVerification: (verificationLink: string, userName: string) => ({
    subject: "Verify Your SkinGuard AI Email Address",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">SkinGuard AI</h1>
        </div>
        <div style="background: #f8fafc; padding: 40px; border-radius: 0 0 8px 8px;">
          <p style="color: #334155; font-size: 16px; margin-bottom: 20px;">Hi ${userName},</p>
          <p style="color: #334155; font-size: 16px; margin-bottom: 30px;">
            Welcome to SkinGuard AI! Please verify your email address to get started.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" style="background: #06b6d4; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Verify Email
            </a>
          </div>
          <p style="color: #64748b; font-size: 14px; margin-bottom: 10px;">
            Or copy and paste this link in your browser:
          </p>
          <p style="color: #06b6d4; font-size: 12px; word-break: break-all; margin-bottom: 30px;">
            ${verificationLink}
          </p>
          <p style="color: #64748b; font-size: 14px; margin-bottom: 20px;">
            This link will expire in 24 hours.
          </p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">
            © 2026 SkinGuard AI. All rights reserved.
          </p>
        </div>
      </div>
    `,
  }),

  welcomeEmail: (userName: string) => ({
    subject: "Welcome to SkinGuard AI!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">SkinGuard AI</h1>
        </div>
        <div style="background: #f8fafc; padding: 40px; border-radius: 0 0 8px 8px;">
          <p style="color: #334155; font-size: 16px; margin-bottom: 20px;">Hi ${userName},</p>
          <p style="color: #334155; font-size: 16px; margin-bottom: 20px;">
            Your email has been verified! You're all set to start tracking your skin health with AI support.
          </p>
          <p style="color: #334155; font-size: 16px; margin-bottom: 30px;">
            Get started by taking your first scan or exploring your dashboard.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${APP_ORIGIN}/dashboard" style="background: #06b6d4; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Go to Dashboard
            </a>
          </div>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">
            © 2026 SkinGuard AI. All rights reserved.
          </p>
        </div>
      </div>
    `,
  }),
};

export async function sendPasswordResetEmail(email: string, userName: string, resetToken: string) {
  const resetLink = `${APP_ORIGIN}/reset-password?token=${resetToken}`;
  const template = emailTemplates.passwordReset(resetLink, userName);

  try {
    await transporter.sendMail({
      from: ENV.emailUser || "noreply@skinguardai.app",
      to: email,
      subject: template.subject,
      html: template.html,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    return { success: false, error };
  }
}

export async function sendEmailVerificationEmail(email: string, userName: string, verificationToken: string) {
  const verificationLink = `${APP_ORIGIN}/verify-email?token=${verificationToken}`;
  const template = emailTemplates.emailVerification(verificationLink, userName);

  try {
    await transporter.sendMail({
      from: ENV.emailUser || "noreply@skinguardai.app",
      to: email,
      subject: template.subject,
      html: template.html,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send email verification email:", error);
    return { success: false, error };
  }
}

export async function sendWelcomeEmail(email: string, userName: string) {
  const template = emailTemplates.welcomeEmail(userName);

  try {
    await transporter.sendMail({
      from: ENV.emailUser || "noreply@skinguardai.app",
      to: email,
      subject: template.subject,
      html: template.html,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    return { success: false, error };
  }
}

// Mailbox that receives moderation reports. Kept separate from the "from"
// address so rotating the SMTP sender does not silently orphan the reports.
const MODERATION_INBOX = process.env.MODERATION_EMAIL || "info@skinguardai.app";

/**
 * Google Play's AI-Generated Content policy requires an in-app way for users to
 * report offensive or harmful AI output "without needing to exit the app", and
 * requires that we actually use those reports to tune moderation. This is the
 * delivery leg of that loop: the report lands in the moderation inbox, and the
 * flagged text is included verbatim so the prompt/safety-threshold change it
 * implies can be made against the real output rather than a paraphrase.
 *
 * The report never carries the user's photo — only the generated text they
 * objected to — so flagging something cannot leak an image to the mailbox.
 */
export async function sendAiContentReport(report: {
  surface: string;
  reason: string;
  details: string;
  content: string;
  language: string;
  userId: string | null;
  userEmail: string | null;
}) {
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  try {
    await transporter.sendMail({
      from: ENV.emailUser || "noreply@skinguardai.app",
      to: MODERATION_INBOX,
      subject: `[SkinGuard AI] AI content report — ${report.reason} (${report.surface})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 700px;">
          <h2 style="color:#0891b2;margin-bottom:4px;">AI content report</h2>
          <p style="color:#64748b;font-size:13px;margin-top:0;">
            Filed from the in-app report control (Google Play AI-Generated Content policy).
          </p>
          <table style="border-collapse:collapse;font-size:14px;">
            <tr><td style="padding:4px 12px 4px 0;color:#64748b;">Screen</td><td>${esc(report.surface)}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;color:#64748b;">Reason</td><td><strong>${esc(report.reason)}</strong></td></tr>
            <tr><td style="padding:4px 12px 4px 0;color:#64748b;">Language</td><td>${esc(report.language)}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;color:#64748b;">User</td><td>${esc(report.userEmail || report.userId || "not signed in")}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;color:#64748b;">Received</td><td>${new Date().toISOString()}</td></tr>
          </table>
          ${report.details ? `<h3 style="margin-bottom:4px;">What the user wrote</h3><p style="white-space:pre-wrap;background:#f8fafc;padding:12px;border-radius:6px;">${esc(report.details)}</p>` : ""}
          ${report.content ? `<h3 style="margin-bottom:4px;">Flagged AI output</h3><pre style="white-space:pre-wrap;background:#f8fafc;padding:12px;border-radius:6px;font-size:12px;">${esc(report.content)}</pre>` : ""}
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send AI content report:", error);
    return { success: false, error };
  }
}

/**
 * Account-deletion request filed from the public /delete-account web page.
 * Google Play requires that public web route to exist alongside the in-app
 * "Delete account" button, because someone who has already uninstalled the app
 * has no in-app path left. Signed-in users delete themselves instantly from the
 * dashboard; this covers everyone who cannot get back in.
 */
export async function sendAccountDeletionRequest(request: {
  email: string;
  note: string;
}) {
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  try {
    await transporter.sendMail({
      from: ENV.emailUser || "noreply@skinguardai.app",
      to: MODERATION_INBOX,
      subject: `[SkinGuard AI] Account deletion request — ${request.email}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 700px;">
          <h2 style="color:#0891b2;margin-bottom:4px;">Account deletion request</h2>
          <p style="color:#64748b;font-size:13px;margin-top:0;">
            Filed from https://www.skinguardai.app/delete-account
          </p>
          <table style="border-collapse:collapse;font-size:14px;">
            <tr><td style="padding:4px 12px 4px 0;color:#64748b;">Account e-mail</td><td><strong>${esc(request.email)}</strong></td></tr>
            <tr><td style="padding:4px 12px 4px 0;color:#64748b;">Received</td><td>${new Date().toISOString()}</td></tr>
          </table>
          ${request.note ? `<h3 style="margin-bottom:4px;">Note</h3><p style="white-space:pre-wrap;background:#f8fafc;padding:12px;border-radius:6px;">${esc(request.note)}</p>` : ""}
          <p style="color:#64748b;font-size:13px;">Verify ownership of the address before erasing, then delete the account and all associated data within 30 days.</p>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send account deletion request:", error);
    return { success: false, error };
  }
}
