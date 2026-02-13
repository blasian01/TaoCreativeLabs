"use server";

import { Resend } from "resend";

export async function submitContactForm(formData: FormData) {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const company = formData.get("company") as string;
    const message = formData.get("message") as string;

    // Validation
    if (!name || !email || !message) {
        return { success: false, error: "Please fill in all required fields." };
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { success: false, error: "Please enter a valid email address." };
    }

    const apiKey = process.env.RESEND_API_KEY;
    const contactEmail = process.env.CONTACT_EMAIL || "hello@fortaify.com";

    if (!apiKey) {
        // Graceful fallback — log the submission when no API key is configured
        console.log("[Contact Form Submission]", { name, email, company, message });
        return {
            success: true,
            message: "Message received. We will follow up shortly.",
        };
    }

    try {
        const resend = new Resend(apiKey);

        await resend.emails.send({
            from: "Tao Creative Labs <noreply@fortaify.com>",
            to: [contactEmail],
            replyTo: email,
            subject: `New Contact: ${name}${company ? ` — ${company}` : ""}`,
            html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; color: #1a1a1a;">
          <h2 style="font-weight: 300; font-size: 20px; margin-bottom: 24px; border-bottom: 1px solid #e0e0e0; padding-bottom: 16px;">
            New Contact Form Submission
          </h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-size: 13px; color: #8a8a8a; width: 100px;">Name</td>
              <td style="padding: 8px 0; font-size: 14px;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-size: 13px; color: #8a8a8a;">Email</td>
              <td style="padding: 8px 0; font-size: 14px;"><a href="mailto:${email}" style="color: #1a1a1a;">${email}</a></td>
            </tr>
            ${company ? `
            <tr>
              <td style="padding: 8px 0; font-size: 13px; color: #8a8a8a;">Company</td>
              <td style="padding: 8px 0; font-size: 14px;">${company}</td>
            </tr>
            ` : ""}
          </table>
          <div style="margin-top: 24px; padding: 20px; background: #f5f5f5; border-radius: 8px;">
            <p style="font-size: 13px; color: #8a8a8a; margin: 0 0 8px;">Message</p>
            <p style="font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${message}</p>
          </div>
        </div>
      `,
        });

        return { success: true, message: "Message sent successfully." };
    } catch (error) {
        console.error("[Contact Form Error]", error);
        return {
            success: false,
            error: "Failed to send message. Please try again later.",
        };
    }
}
