"use server";

import { Resend } from 'resend';
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';
import { headers } from 'next/headers';
import { createHash } from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INJECTION_PATTERN = /<script|javascript:|onerror=|onload=/i;

let ratelimit: Ratelimit | null = null;

function getRateLimiter(): Ratelimit {
  if(!ratelimit){
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN, 
    });
    ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.fixedWindow(3, "10 m"),
      analytics: true,
      prefix: "contact-form",
    });
  }
  return ratelimit;
}

function getRateLimiterIdentity(ip: string, email: string): string{ // should be using only ip for enforcing
  const raw = email.toLowerCase() + "|" + ip;
  return createHash("sha256").update(raw).digest("hex");
}

function sanitizeInput(value: FormDataEntryValue | null): string {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .normalize("NFC")
    .replace(/<[^>]*>/g, "")
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .trim();
}

function hasInjectionPattern(...values: string[]): boolean {
  return values.some((value) => INJECTION_PATTERN.test(value));
}

export default async function sendEmail(formData: FormData) {
  const name = sanitizeInput(formData.get("name"));
  const email = sanitizeInput(formData.get("email"));
  const subject = sanitizeInput(formData.get("subject")) || "Test email from contact form";
  const message = sanitizeInput(formData.get("message"));
  const website = sanitizeInput(formData.get("website"));

  // check if redis is setup
  if(!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN){
    throw new Error("Upstash Redis is not configured.");
  }

  // Honeypot check: silently succeed to avoid confirming anti-bot signal.
  if (website) {
    return { success: true as const };
  }

  if (!name || name.length > 80) {
    throw new Error("Invalid name.");
  }

  if (!email || email.length > 120 || !EMAIL_REGEX.test(email)) {
    throw new Error("Invalid email.");
  }

  if (subject.length > 120) {
    throw new Error("Invalid subject.");
  }

  if (!message || message.length < 10 || message.length > 2000) {
    throw new Error("Invalid message.");
  }

  if (hasInjectionPattern(name, email, subject, message)) {
    throw new Error("Unsafe input detected.");
  }

  // finding the IP from the headers
  const requestHeader = await headers();
  const xForwardedFor = requestHeader.get("x-forwarded-for") ?? "";
  const ip = xForwardedFor.split(",")[0]?.trim() || requestHeader.get("x-real-ip") || "unknown";

  const identifier = getRateLimiterIdentity(email, ip);
  const result = await getRateLimiter().limit(identifier);

  if(!result.success){
    throw new Error("Too many requests. Please try again later.");
  }

  await resend.emails.send({
    from: 'hello@geraldmanurung.site',
    to: process.env.CONTACT_EMAIL_TO || 'g3rald.dj@gmail.com',
    replyTo: email || undefined,
    subject: subject || 'Test email from contact form',
    html: `
      <p><strong>Contact form submission</strong></p>
      <p><strong>Name:</strong> ${name || "N/A"}</p>
      <p><strong>Email sent to:</strong> ${email || "N/A"}</p>
      <p><strong>Message:</strong></p>
      <p>${message || "(No message provided)"}</p>
    `
  });

  return { success: true as const };
}
