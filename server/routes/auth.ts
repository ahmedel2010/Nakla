import express from "express";
import nodemailer from "nodemailer";
import { verificationCache, generateVerificationCode } from "../lib/store.js";

export const authRouter = express.Router();

authRouter.get("/auth/google/url", (req, res) => {
  try {
    const origin = (req.query.origin as string) || process.env.APP_URL || "";
    const redirectUri = `${origin}/auth/callback`;
    const clientId = process.env.GOOGLE_CLIENT_ID;

    if (!clientId) {
      return res.status(400).json({
        error: "missing_credentials",
        message: "لم يتم تهيئة مُعرّف Google Client ID. يرجى إضافة GOOGLE_CLIENT_ID و GOOGLE_CLIENT_SECRET أولاً."
      });
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      prompt: "select_account",
      access_type: "offline",
      state: redirectUri
    });

    return res.json({ url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}` });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to generate authorization request." });
  }
});

authRouter.get(["/auth/callback", "/auth/callback/"], async (req, res): Promise<any> => {
  try {
    const { code, state } = req.query;
    if (!code) {
      return res.send(`<html><body style="font-family:sans-serif;text-align:center;padding:40px;background:#f8fafc"><p style="color:#ef4444;font-weight:bold">خطأ: لم نتمكن من الحصول على الكود من جوجل.</p><script>setTimeout(()=>window.close(),4000)</script></body></html>`);
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return res.send(`<html><body style="font-family:sans-serif;text-align:center;padding:40px;background:#f8fafc;direction:rtl"><p style="color:#ef4444;font-weight:bold;font-size:18px">المتغيرات GOOGLE_CLIENT_ID أو GOOGLE_CLIENT_SECRET مفقودة!</p><script>setTimeout(()=>window.close(),6000)</script></body></html>`);
    }

    let redirectUri = "";
    if (state && typeof state === "string" && (state.startsWith("http://") || state.startsWith("https://"))) {
      redirectUri = state;
    } else {
      const protocol = req.secure || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
      redirectUri = `${protocol}://${req.headers.host}/auth/callback`;
    }

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code: code as string,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code"
      })
    });

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text();
      throw new Error(`Google token exchange failed: ${errText}`);
    }

    const tokenData = await tokenResponse.json();
    const userinfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });

    if (!userinfoResponse.ok) throw new Error("Failed to fetch user profile.");

    const userInfo = await userinfoResponse.json();
    const sanitizedUser = {
      email: userInfo.email,
      name: userInfo.name || userInfo.given_name || "Google User",
      picture: userInfo.picture || ""
    };

    return res.send(`
      <html>
        <head>
          <title>Google Authentication Successful</title>
          <style>
            body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;text-align:center;padding:50px 20px;background-color:#f8fafc;color:#1e293b}
            .spinner{border:4px solid rgba(0,0,0,.1);width:36px;height:36px;border-radius:50%;border-left-color:#4f46e5;animation:spin 1s linear infinite;margin:0 auto 20px}
            @keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
            h2{color:#0f172a;margin-bottom:8px;font-size:20px;font-weight:800}
            p{color:#64748b;font-size:14px;margin-top:0}
          </style>
        </head>
        <body>
          <div class="spinner"></div>
          <h2>تم تسجيل الدخول بنجاح!</h2>
          <p>جاري مزامنة بيانات الحساب...</p>
          <script>
            var user = ${JSON.stringify(sanitizedUser)};
            try {
              if (window.opener && !window.opener.closed) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', user: user }, window.location.origin);
                setTimeout(function(){ window.close(); }, 500);
              } else {
                // Fallback: store in sessionStorage and redirect to home
                sessionStorage.setItem('oauth_pending_user', JSON.stringify(user));
                window.location.replace('/');
              }
            } catch (err) {
              sessionStorage.setItem('oauth_pending_user', JSON.stringify(user));
              window.location.replace('/');
            }
          </script>
        </body>
      </html>
    `);
  } catch (err: any) {
    return res.send(`<html><body style="font-family:sans-serif;text-align:center;padding:40px;background:#f8fafc;direction:rtl"><p style="color:#ef4444;font-weight:bold;font-size:18px">حدث خطأ أثناء تسجيل الدخول عبر Google!</p><p style="color:#64748b;font-size:14px">${err.message || ""}</p><script>setTimeout(()=>window.close(),7000)</script></body></html>`);
  }
});

authRouter.post("/send-verification-code", async (req, res): Promise<any> => {
  try {
    const { email } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({ error: "الرجاء إدخال بريدك الإلكتروني لإرسال رمز التحقق." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const code = generateVerificationCode();
    verificationCache.set(cleanEmail, { code, expiresAt: Date.now() + 8 * 60 * 1000 });

    const isSmtpConfigured = process.env.SMTP_USER && process.env.SMTP_PASS;
    if (!isSmtpConfigured) {
      return res.status(400).json({ error: "خادم البريد (SMTP) غير مفعّل. يرجى تهيئة SMTP_USER و SMTP_PASS في الإعدادات." });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });

    const htmlEmail = `
      <div dir="rtl" style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;max-width:550px;margin:0 auto;border:1px solid #e1e8f0;padding:32px 24px;border-radius:20px;background:#ffffff;text-align:right">
        <div style="text-align:center;margin-bottom:28px">
          <div style="display:inline-block;padding:12px 20px;background:#f5f3ff;border-radius:16px">
            <span style="font-size:26px;font-weight:900;color:#4f46e5">منصة نقلة - NaKla</span>
          </div>
        </div>
        <h2 style="font-size:20px;font-weight:850;color:#0f172a;margin-bottom:12px;text-align:center">🛡️ رمز التحقق لتأكيد الهوية وتفعيل الحساب</h2>
        <div style="background:#fafafa;border:2px dashed #4f46e5;border-radius:16px;padding:20px;text-align:center;margin-bottom:28px">
          <span style="font-size:36px;font-weight:900;letter-spacing:5px;color:#4f46e5;font-family:'Courier New',monospace">${code}</span>
        </div>
        <p style="font-size:12px;color:#f43f5e;text-align:center;font-weight:bold">* هذا الرمز صالح لمدة 8 دقائق فقط.</p>
      </div>
    `;

    try {
      await transporter.sendMail({
        from: `"Nakla - منصة نقلة" <${process.env.SMTP_USER}>`,
        to: cleanEmail,
        subject: `رمز التحقق الخاص بك هو: ${code}`,
        html: htmlEmail
      });
      return res.json({ success: true, message: "تم إرسال رمز التحقق إلى بريدك الإلكتروني بنجاح!", deliveryMethod: "smtp" });
    } catch (mailError: any) {
      return res.status(500).json({ error: "فشل إرسال البريد الإلكتروني: " + (mailError.message || "") });
    }
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "فشل إرسال بريد رمز التحقق." });
  }
});

authRouter.post("/verify-code", async (req, res): Promise<any> => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: "الرجاء توفير البريد ورمز التحقق." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const record = verificationCache.get(cleanEmail);

    if (!record) {
      return res.status(400).json({ error: "لم نجد طلب تحقق نشط لهذا البريد. يرجى إعادة إرسال الكود." });
    }
    if (Date.now() > record.expiresAt) {
      verificationCache.delete(cleanEmail);
      return res.status(400).json({ error: "انتهت صلاحية رمز التحقق (8 دقائق). أعد إرسال كود جديد." });
    }
    if (record.code !== code.trim()) {
      return res.status(400).json({ error: "رمز التحقق غير صحيح. يرجى مراجعة الكود والمحاولة مجدداً." });
    }

    verificationCache.delete(cleanEmail);
    return res.json({ success: true, message: "تم التحقق من بريدك بنجاح!" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "فشلت عملية التحقق من الكود." });
  }
});
