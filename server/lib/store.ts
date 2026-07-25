import crypto from "crypto";

export const activationCodesStore = new Map<string, {
  used: boolean;
  createdAt: Date;
  expiresAt: Date;
}>();

export const paymentRequestsStore: Array<{
  id: string;
  name: string;
  whatsapp: string;
  method: string;
  reference: string;
  submittedAt: Date;
  status: "pending" | "activated";
}> = [];

export const verificationCache = new Map<string, { code: string; expiresAt: number }>();

export const generateVerificationCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();
