// Importing modules with ES6 syntax
import admin from "firebase-admin";
import nodemailer from "nodemailer";
import stripe from "stripe";
import cors from "cors";
import axios from "axios";
import { onRequest } from "firebase-functions/v2/https";
import * as functions from "firebase-functions/v1";

// Additional constants
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || "AIzaSyCQQghMN4w-_9fww7rdi7OZYHRrWtU4OBk";

// CORS whitelist for production domains
const corsHandler = cors({
  origin: [
    "https://posmate-5fc0a.web.app",
    "https://posmate-5fc0a.firebaseapp.com",
    "https://divinepos.com",
    "https://www.divinepos.com",
    "http://localhost:3000",
  ],
});

admin.initializeApp();

const db = admin.firestore();

//create and config transporter (lazy init so env secrets are resolved at runtime)
let _transporter = null;
function getTransporter() {
  if (!_transporter) {
    _transporter = nodemailer.createTransport({
      host: "smtp.office365.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.SMTP_USER || "support@divinepos.com",
        pass: process.env.SMTP_PASS || "",
      },
      tls: {
        ciphers: "SSLv3",
      },
    });
  }
  return _transporter;
}
// Backward compat — existing code references `transporter` directly
const transporter = { sendMail: (...args) => getTransporter().sendMail(...args) };

// ─── Error Alert: Email support when a system error is logged ───
// Rate-limited: max 1 email per 5 minutes to avoid spam during error storms
let lastErrorEmailSent = 0;
const ERROR_EMAIL_COOLDOWN_MS = 5 * 60 * 1000;

export const onSystemError = functions.firestore
  .document("systemErrors/{errorId}")
  .onCreate(async (snap, context) => {
    const error = snap.data();
    const now = Date.now();

    // Only email for critical/high severity, or all if first error in window
    const severity = error.severity || "medium";
    if (severity !== "critical" && severity !== "high" && now - lastErrorEmailSent < ERROR_EMAIL_COOLDOWN_MS) {
      return null;
    }

    // Rate limit emails
    if (now - lastErrorEmailSent < ERROR_EMAIL_COOLDOWN_MS) {
      return null;
    }
    lastErrorEmailSent = now;

    const severityColors = {
      critical: "#dc2626",
      high: "#ea580c",
      medium: "#d97706",
      low: "#6b7280",
    };
    const severityColor = severityColors[severity] || "#6b7280";

    const mailOptions = {
      from: "support@divinepos.com",
      to: "support@divinepos.com",
      subject: `[${severity.toUpperCase()}] System Error — Divine POS`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 24px;">
          <div style="background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div style="background: ${severityColor}; padding: 16px 24px;">
              <h2 style="margin: 0; color: #fff; font-size: 18px;">System Error Alert</h2>
            </div>
            <div style="padding: 24px;">
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr>
                  <td style="padding: 8px 12px; font-weight: 600; color: #374151; width: 120px; vertical-align: top;">Severity</td>
                  <td style="padding: 8px 12px;">
                    <span style="background: ${severityColor}; color: #fff; padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; text-transform: uppercase;">${severity}</span>
                  </td>
                </tr>
                <tr style="background: #f9fafb;">
                  <td style="padding: 8px 12px; font-weight: 600; color: #374151; vertical-align: top;">Source</td>
                  <td style="padding: 8px 12px; color: #111827;">${error.source || "unknown"}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 12px; font-weight: 600; color: #374151; vertical-align: top;">Message</td>
                  <td style="padding: 8px 12px; color: #111827;">${(error.message || "Unknown error").slice(0, 500)}</td>
                </tr>
                <tr style="background: #f9fafb;">
                  <td style="padding: 8px 12px; font-weight: 600; color: #374151; vertical-align: top;">Route</td>
                  <td style="padding: 8px 12px; color: #111827;">${error.route || "N/A"}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 12px; font-weight: 600; color: #374151; vertical-align: top;">User</td>
                  <td style="padding: 8px 12px; color: #111827;">${error.email || error.uid || "Not logged in"}</td>
                </tr>
                <tr style="background: #f9fafb;">
                  <td style="padding: 8px 12px; font-weight: 600; color: #374151; vertical-align: top;">App Version</td>
                  <td style="padding: 8px 12px; color: #111827;">${error.appVersion || "N/A"}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 12px; font-weight: 600; color: #374151; vertical-align: top;">Time</td>
                  <td style="padding: 8px 12px; color: #111827;">${new Date().toLocaleString("en-CA", { timeZone: "America/Toronto" })}</td>
                </tr>
                <tr style="background: #f9fafb;">
                  <td style="padding: 8px 12px; font-weight: 600; color: #374151; vertical-align: top;">Error ID</td>
                  <td style="padding: 8px 12px; color: #6b7280; font-family: monospace; font-size: 12px;">${context.params.errorId}</td>
                </tr>
              </table>
              ${error.stack ? `
              <div style="margin-top: 16px;">
                <div style="font-weight: 600; color: #374151; font-size: 13px; margin-bottom: 8px;">Stack Trace</div>
                <pre style="background: #1e293b; color: #e2e8f0; padding: 16px; border-radius: 8px; font-size: 12px; overflow-x: auto; white-space: pre-wrap; word-break: break-word; margin: 0;">${(error.stack || "").slice(0, 1500)}</pre>
              </div>
              ` : ""}
            </div>
            <div style="padding: 16px 24px; background: #f9fafb; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
              Divine POS Error Monitor — <a href="https://console.firebase.google.com/project/posmate-5fc0a/firestore/data/~2FsystemErrors~2F${context.params.errorId}" style="color: #2563eb;">View in Firebase Console</a>
            </div>
          </div>
        </div>
      `,
    };

    try {
      await getTransporter().sendMail(mailOptions);
      console.log(`Error alert email sent for ${context.params.errorId} (${severity})`);
    } catch (emailErr) {
      console.error("Failed to send error alert email:", emailErr);
    }

    return null;
  });

// ─── Auth Trigger: Log new user signups ───
export const onUserCreated = functions.auth.user().onCreate(async (user) => {
  try {
    await db.collection("systemLogs").add({
      type: "signup",
      uid: user.uid,
      email: user.email || null,
      displayName: user.displayName || null,
      metadata: {
        phoneNumber: user.phoneNumber || null,
        provider: user.providerData?.[0]?.providerId || "email",
      },
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      userAgent: "server-trigger",
      url: "server-trigger",
    });
  } catch (err) {
    console.error("onUserCreated: failed to log signup", err);
  }
});

// ─── Superadmin: Delete a user account and all their data ───
const SUPERADMIN_UID = "0IV6GKQazUcp8hqoTsDG9dXIqrA3";

export const deleteAccount = functions.https.onCall(async (data, context) => {
  // Verify caller is superadmin
  if (!context.auth || context.auth.uid !== SUPERADMIN_UID) {
    throw new functions.https.HttpsError("permission-denied", "Not authorized");
  }

  const targetUid = data.uid;
  if (!targetUid || typeof targetUid !== "string") {
    throw new functions.https.HttpsError("invalid-argument", "Missing uid");
  }

  // Prevent self-deletion
  if (targetUid === context.auth.uid) {
    throw new functions.https.HttpsError("invalid-argument", "Cannot delete own account");
  }

  try {
    // Delete all user data (doc + all subcollections recursively)
    await admin.firestore().recursiveDelete(db.collection("users").doc(targetUid));

    // Delete public store data
    await admin.firestore().recursiveDelete(db.collection("public").doc(targetUid));

    // Delete Firebase Auth account
    await admin.auth().deleteUser(targetUid);

    return { success: true };
  } catch (err) {
    console.error("deleteAccount failed:", err);
    throw new functions.https.HttpsError("internal", err.message || "Deletion failed");
  }
});

// ─── Superadmin: Switch a user's account plan ───
export const setAccountPlan = functions.https.onCall(async (data, context) => {
  if (!context.auth || context.auth.uid !== SUPERADMIN_UID) {
    throw new functions.https.HttpsError("permission-denied", "Not authorized");
  }

  const { uid, plan } = data;
  if (!uid || !["trial", "starter", "professional"].includes(plan)) {
    throw new functions.https.HttpsError("invalid-argument", "Invalid uid or plan");
  }

  try {
    const userRef = db.collection("users").doc(uid);

    // Cancel all existing subscriptions
    const subsSnap = await userRef.collection("subscriptions").get();
    const batch = db.batch();
    subsSnap.forEach((doc) => {
      batch.update(doc.ref, { status: "canceled" });
    });
    await batch.commit();

    if (plan === "trial") {
      // Set free trial for 31 days
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + 31);
      await userRef.update({
        freeTrial: admin.firestore.Timestamp.fromDate(trialEnd),
      });
    } else {
      // Remove free trial if exists
      await userRef.update({
        freeTrial: admin.firestore.FieldValue.delete(),
      });

      // Create active subscription doc
      const role = plan === "starter" ? "Starter Plan" : "Professional Plan";
      await userRef.collection("subscriptions").add({
        role,
        status: "active",
        created: admin.firestore.FieldValue.serverTimestamp(),
        metadata: { source: "superadmin" },
      });
    }

    return { success: true };
  } catch (err) {
    console.error("setAccountPlan failed:", err);
    throw new functions.https.HttpsError("internal", err.message || "Plan switch failed");
  }
});

export const sendCustomEmail = functions.https.onRequest((req, res) => {
  //for testing purposes
  // console.log(
  //   "from sendEmail function. The request object is:",
  //   JSON.stringify(req.body)
  // );

  //enable CORS using the `cors` express middleware.
  corsHandler(req, res, () => {
    //get contact form data from the req and then assigned it to variables
    const fromEmail = req.body.fromEmail;
    const toEmail = req.body.toEmail;
    const name = req.body.name;
    const subject = req.body.subject;
    const message = req.body.message;

    //config the email message
    const mailOptions = {
      from: fromEmail,
      to: toEmail,
      subject: subject,
      text: message,
    };

    //call the built in `sendMail` function and return different responses upon success and failure
    return transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).send({
          data: {
            status: 500,
            message: error.toString(),
          },
        });
      }

      return res.status(200).send({
        data: {
          status: 200,
          message: "sent",
        },
      });
    });
  });
});

//export the cloud function called `sendEmail`
export const sendPasswordResetEmail = functions.https.onRequest((req, res) => {
  //enable CORS using the `cors` express middleware.
  corsHandler(req, res, () => {
    //get contact form data from the req and then assigned it to variables
    const email = req.body.email;

    admin
      .auth()
      .generatePasswordResetLink(email)
      .then(async (link) => {
        const updatedLink = link.replace(
          "posmate-5fc0a.firebaseapp",
          "auth.divinepos",
        );

        const mailOptions = {
          from: "support@divinepos.com",
          to: email,
          subject: "Divine Pos Password Reset",
          html: ResetPasswordEmailHtml(updatedLink),
        };
        return transporter.sendMail(mailOptions, (error, data) => {
          if (error) {
            return res.send(error.toString());
          }
          var returnData = JSON.stringify(data);
          return res.send(`Sent! ${returnData}`);
        });
      })
      .catch((error) => {
        res.status(500).send({
          data: {
            status: 500,
            message: error.toString(),
          },
        });
      });
  });
});

//export the cloud function called `sendEmail`
export const sendSettingsPass = functions.https.onRequest((req, res) => {
  //enable CORS using the `cors` express middleware.
  corsHandler(req, res, () => {
    //get contact form data from the req and then assigned it to variables
    const email = req.body.email;
    const password = req.body.password;

    const mailOptions = {
      from: "support@divinepos.com",
      to: email,
      subject: "Divine Pos Settings Password",
      html: SettingsPasswordEmailHtml(password),
    };
    return transporter.sendMail(mailOptions, (error, data) => {
      if (error) {
        return res.send(error.toString());
      }
      var returnData = JSON.stringify(data);
      return res.send(`Sent! ${returnData}`);
    });
  });
});

export const processPayment = functions.https.onRequest(async (req, res) => {
  corsHandler(req, res, async () => {
    try {
      const { token, amount, currency, storeUID, orderDetails, storeDetails } =
        req.body;

      // Validate required fields
      if (!token || !storeUID || !orderDetails) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
      }

      // Validate amount is a positive number within reasonable bounds
      const parsedAmount = parseFloat(amount);
      if (!parsedAmount || parsedAmount <= 0 || parsedAmount > 100000) {
        return res.status(400).json({ success: false, message: "Invalid payment amount" });
      }

      // Server-side cart total validation
      if (orderDetails.cart && Array.isArray(orderDetails.cart)) {
        let serverTotal = 0;
        for (const item of orderDetails.cart) {
          const price = parseFloat(item.price) || 0;
          const qty = parseFloat(item.quantity ?? "1") || 1;
          serverTotal += price * qty;
        }
        // Add delivery fee if applicable
        if (orderDetails.delivery && storeDetails?.deliveryPrice) {
          serverTotal += parseFloat(storeDetails.deliveryPrice) || 0;
        }
        // Apply tax
        const taxRate = parseFloat(storeDetails?.taxRate) || 13;
        serverTotal = serverTotal * (1 + taxRate / 100);
        // Allow 5% tolerance for rounding differences
        if (Math.abs(serverTotal - parsedAmount) > serverTotal * 0.05 + 1) {
          console.warn(`Amount mismatch: client=${parsedAmount}, server=${serverTotal.toFixed(2)}`);
          return res.status(400).json({ success: false, message: "Payment amount does not match order total" });
        }
      }

      // Fetch the secret key from Firestore
      const configSnapshot = await db.collection("users").doc(storeUID).get();
      if (!configSnapshot.exists) {
        return res.status(404).json({ success: false, message: "Store not found" });
      }
      const secretKey = configSnapshot.data().stripeSecretKey;
      if (!secretKey) {
        return res.status(400).json({ success: false, message: "Store payment not configured" });
      }

      const charge = await stripe(secretKey).charges.create({
        amount: Math.round(parsedAmount * 100),
        currency: currency || "cad",
        source: token,
      });

      // Create the pending order
      await db
        .collection("users")
        .doc(storeUID)
        .collection("pendingOrders")
        .add({
          ...orderDetails,
          date: admin.firestore.Timestamp.now(),
        });

      // Send success response immediately (don't wait for email)
      res.status(200).json({ success: true, message: "Payment succeeded" });

      // Send confirmation email asynchronously (fire-and-forget)
      try {
        const mailOptions = {
          from: "support@divinepos.com",
          to: orderDetails.customer.email,
          subject: "Order Confirmation",
          html: OrderConfirmationEmailHtml(orderDetails, storeDetails),
        };
        await transporter.sendMail(mailOptions);
      } catch (emailErr) {
        console.warn("Confirmation email failed (payment succeeded):", emailErr.message);
      }
    } catch (error) {
      console.error("Error during payment:", error);
      res
        .status(500)
        .json({ success: false, message: `Payment failed: ${error.message}` });
    }
  });
});

export const getLatLng = onRequest(async (req, res) => {
  corsHandler(req, res, async () => {
    try {
      const { placeId } = req.body;

      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry&key=${GOOGLE_API_KEY}`,
      );

      const data = response.data;

      if (
        data.status === "OK" &&
        data.result.geometry &&
        data.result.geometry.location
      ) {
        const { lat, lng } = data.result.geometry.location;
        res.status(200).json({
          success: true,
          message: "Success",
          data: { lat, lng },
        });
      } else {
        res.status(500).json({
          success: false,
          message: `Error: No results found for the place ID`,
        });
      }
    } catch (error) {
      console.error("Error during request:", error);
      res.status(500).json({
        success: false,
        message: `Error: ${error.message}`,
      });
    }
  });
});

export const sendWelcomeEmail = functions.https.onRequest((req, res) => {
  //enable CORS using the `cors` express middleware.
  corsHandler(req, res, () => {
    //get contact form data from the req and then assigned it to variables
    const email = req.body.email;
    const name = req.body.name;
    const isFreeTrial = req.body.isFreeTrial;

    const mailOptions = {
      from: "support@divinepos.com",
      to: email,
      subject: "Welcome to Divine POS!",
      html: isFreeTrial ? WelcomeEmailHtml(name) : WelcomeEmailHtmlPaid(name),
    };
    return transporter.sendMail(mailOptions, (error, data) => {
      if (error) {
        return res.send(error.toString());
      }
      var returnData = JSON.stringify(data);
      return res.send(`Sent! ${returnData}`);
    });
  });
});

const ResetPasswordEmailHtml = (updatedLink) => {
  return `
  <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" style="line-height: inherit;">
  <head style="line-height: inherit;">
    <!--[if gte mso 9]>
      <xml>
        <o:OfficeDocumentSettings>
          <o:AllowPNG />
          <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
      </xml>
    <![endif]-->
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" style="line-height: inherit;">
    <meta name="viewport" content="width=device-width, initial-scale=1.0" style="line-height: inherit;">
    <meta name="x-apple-disable-message-reformatting" style="line-height: inherit;">
    <!--[if !mso]><!-->
    <meta http-equiv="X-UA-Compatible" content="IE=edge" style="line-height: inherit;">
    <!--<![endif]-->
    <title style="line-height: inherit;"></title>


    <!--[if !mso]><!-->
    <!--<![endif]-->
  </head>

  <body class="clean-body u_body" style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #f9f9f9;color: #000000;line-height: inherit;">
    <!--[if IE]><div class="ie-container"><![endif]-->
    <!--[if mso]><div class="mso-container"><![endif]-->
    <table id="u_body" style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;margin: 0 auto;background-color: #f9f9f9;width: 100%;line-height: inherit;color: #000000;" cellpadding="0" cellspacing="0">
      <tbody style="line-height: inherit;">
        <tr style="vertical-align: top;line-height: inherit;border-collapse: collapse;">
          <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;line-height: inherit;color: #000000;">
            <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="background-color: #f9f9f9;"><![endif]-->

            <div class="u-row-container" style="padding: 0px;background-color: #f9f9f9;line-height: inherit;">
              <div class="u-row" style="margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #f9f9f9;line-height: inherit;width: 100% !important;">
                <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;line-height: inherit;">
                  <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: #f9f9f9;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #f9f9f9;"><![endif]-->

                  <!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                  <div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;line-height: inherit;width: 600px !important;">
                    <div style="height: 100%;width: 100% !important;line-height: inherit;margin: 0 auto;">
                      <!--[if (!mso)&(!IE)]><!--><div style="box-sizing: border-box;height: 100%;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;line-height: inherit;"><!--<![endif]-->
                        <table style="font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                          <tbody style="line-height: inherit;">
                            <tr style="line-height: inherit;vertical-align: top;border-collapse: collapse;">
                              <td style="overflow-wrap: break-word;word-break: break-word;padding: 15px;font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" align="left">
                                <table height="0px" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;border-top: 1px solid #f9f9f9;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;line-height: inherit;color: #000000;">
                                  <tbody style="line-height: inherit;">
                                    <tr style="vertical-align: top;line-height: inherit;border-collapse: collapse;">
                                      <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;font-size: 0px;line-height: 0px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;color: #000000;">
                                        <span style="line-height: inherit;">&#160;</span>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        <!--[if (!mso)&(!IE)]><!-->
                      </div>
                      <!--<![endif]-->
                    </div>
                  </div>
                  <!--[if (mso)|(IE)]></td><![endif]-->
                  <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                </div>
              </div>
            </div>

            <div class="u-row-container" style="padding: 0px;background-color: transparent;line-height: inherit;">
              <div class="u-row" style="margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #ffffff;line-height: inherit;width: 100% !important;">
                <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;line-height: inherit;">
                  <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #ffffff;"><![endif]-->

                  <!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                  <div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;line-height: inherit;width: 600px !important;">
                    <div style="height: 100%;width: 100% !important;line-height: inherit;margin: 0 auto;">
                      <!--[if (!mso)&(!IE)]><!--><div style="box-sizing: border-box;height: 100%;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;line-height: inherit;"><!--<![endif]-->
                        <table style="font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                          <tbody style="line-height: inherit;">
                            <tr style="line-height: inherit;vertical-align: top;border-collapse: collapse;">
                              <td style="overflow-wrap: break-word;word-break: break-word;padding: 25px 10px;font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" align="left">
                                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;">
                                  <tr style="line-height: inherit;vertical-align: top;border-collapse: collapse;">
                                    <td style="padding-right: 0px;padding-left: 0px;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" align="center">
                                      <img src="https://drive.usercontent.google.com/download?id=1r7_iRR9PuWgLGl4RyQXg9t_FLrYnlfcm"
                                      alt="DPOS Logo" title="DPOS Logo" style="outline: none;text-decoration: none;display: inline-block;height: auto;width: 168px;/* fixed width for consistency */
    max-width: 100%;/* ensures responsiveness */: ;line-height: inherit;" width="168">
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        <!--[if (!mso)&(!IE)]><!-->
                      </div>
                      <!--<![endif]-->
                    </div>
                  </div>
                  <!--[if (mso)|(IE)]></td><![endif]-->
                  <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                </div>
              </div>
            </div>

            <div class="u-row-container" style="padding: 0px;background-color: transparent;line-height: inherit;">
              <div class="u-row" style="margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #161a39;line-height: inherit;width: 100% !important;">
                <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;line-height: inherit;">
                  <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #161a39;"><![endif]-->

                  <!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                  <div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;line-height: inherit;width: 600px !important;">
                    <div style="height: 100%;width: 100% !important;line-height: inherit;margin: 0 auto;">
                      <!--[if (!mso)&(!IE)]><!--><div style="box-sizing: border-box;height: 100%;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;line-height: inherit;"><!--<![endif]-->
                        <table style="font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                          <tbody style="line-height: inherit;">
                            <tr style="line-height: inherit;vertical-align: top;border-collapse: collapse;">
                              <td style="overflow-wrap: break-word;word-break: break-word;padding: 35px 10px 10px;font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" align="left">
                                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;">
                                  <tr style="line-height: inherit;vertical-align: top;border-collapse: collapse;">
                                    <td style="padding-right: 0px;padding-left: 0px;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" align="center">
                                      <img align="center" border="0"
                                      src="https://drive.usercontent.google.com/download?id=191ZVe851C-M9uTp3e2H1DAZ2nyYqMBdP"
                                      alt="Image" title="Image" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 10%;max-width: 58px;line-height: inherit;" width="58">
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        <table style="font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                          <tbody style="line-height: inherit;">
                            <tr style="line-height: inherit;vertical-align: top;border-collapse: collapse;">
                              <td style="overflow-wrap: break-word;word-break: break-word;padding: 0px 10px 30px;font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" align="left">
                                <div style="
                                    font-size: 14px;
                                    line-height: 140%;
                                    text-align: left;
                                    word-wrap: break-word;
                                  ">
                                  <p style="font-size: 14px;line-height: 140%;text-align: center;margin: 0;">
                                    <span style="
                                        font-size: 28px;
                                        line-height: 39.2px;
                                        color: #ffffff;
                                        font-family: Lato, sans-serif;
                                      ">Please reset your password
                                    </span>
                                  </p>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        <!--[if (!mso)&(!IE)]><!-->
                      </div>
                      <!--<![endif]-->
                    </div>
                  </div>
                  <!--[if (mso)|(IE)]></td><![endif]-->
                  <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                </div>
              </div>
            </div>

            <div class="u-row-container" style="padding: 0px;background-color: transparent;line-height: inherit;">
              <div class="u-row" style="margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #ffffff;line-height: inherit;width: 100% !important;">
                <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;line-height: inherit;">
                  <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #ffffff;"><![endif]-->

                  <!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                  <div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;line-height: inherit;width: 600px !important;">
                    <div style="height: 100%;width: 100% !important;line-height: inherit;margin: 0 auto;">
                      <!--[if (!mso)&(!IE)]><!--><div style="box-sizing: border-box;height: 100%;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;line-height: inherit;"><!--<![endif]-->
                        <table style="font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                          <tbody style="line-height: inherit;">
                            <tr style="line-height: inherit;vertical-align: top;border-collapse: collapse;">
                              <td style="overflow-wrap: break-word;word-break: break-word;padding: 40px 40px 30px;font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" align="left">
                                <div style="
                                    font-size: 14px;
                                    line-height: 140%;
                                    text-align: left;
                                    word-wrap: break-word;
                                  ">
                                  <p style="font-size: 14px;line-height: 140%;margin: 0;">
                                    <span style="
                                        font-size: 18px;
                                        line-height: 25.2px;
                                        color: #666666;
                                      ">Hello,
                                  </span></p>
                                  <p style="font-size: 14px;line-height: 140%;margin: 0;">
                                  </p>
                                  <p style="font-size: 14px;line-height: 140%;margin: 0;">
                                    <span style="
                                        font-size: 18px;
                                        line-height: 25.2px;
                                        color: #666666;
                                      ">We have sent you this email in response
                                      to your request to reset your password to
                                      Divine POS.
                                  </span></p>
                                  <p style="font-size: 14px;line-height: 140%;margin: 0;">
                                  </p>
                                  <p style="font-size: 14px;line-height: 140%;margin: 0;">
                                    <span style="
                                        font-size: 18px;
                                        line-height: 25.2px;
                                        color: #666666;
                                      ">To reset your password, please follow the
                                      link below:
                                    </span>
                                  </p>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        <table style="font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                          <tbody style="line-height: inherit;">
                            <tr style="line-height: inherit;vertical-align: top;border-collapse: collapse;">
                              <td style="overflow-wrap: break-word;word-break: break-word;padding: 0px 40px;font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" align="left">
                                <!--[if mso
                                  ]><style>
                                    .v-button {
                                      background: transparent !important;
                                    }
                                  </style><!
                                [endif]-->
                                <div align="left" style="line-height: inherit;">
                                  <!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="" style="height:51px; v-text-anchor:middle; width:205px;" arcsize="2%"  stroke="f" fillcolor="#18163a"><w:anchorlock/><center style="color:#FFFFFF;"><![endif]-->
                                  <a href="${updatedLink}" target="_blank" class="v-button" style="box-sizing: border-box;display: inline-block;text-decoration: none;-webkit-text-size-adjust: none;text-align: center;color: #ffffff;background-color: #18163a;border-radius: 1px;-webkit-border-radius: 1px;-moz-border-radius: 1px;width: auto;max-width: 100%;overflow-wrap: break-word;word-break: break-word;word-wrap: break-word;mso-border-alt: none;font-size: 14px;line-height: inherit;">
                                    <span style="
                                        display: block;
                                        padding: 15px 40px;
                                        line-height: 120%;
                                      "><span style="
                                          font-size: 18px;
                                          line-height: 21.6px;
                                        ">Reset Password
                                  </span></span></a>
                                  <!--[if mso]></center></v:roundrect><![endif]-->
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        <table style="font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                          <tbody style="line-height: inherit;">
                            <tr style="line-height: inherit;vertical-align: top;border-collapse: collapse;">
                              <td style="overflow-wrap: break-word;word-break: break-word;padding: 40px 40px 30px;font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" align="left">
                                <div style="
                                    font-size: 14px;
                                    line-height: 140%;
                                    text-align: left;
                                    word-wrap: break-word;
                                  ">
                                  <p style="font-size: 14px;line-height: 140%;margin: 0;">
                                    <span style="
                                        color: #888888;
                                        font-size: 14px;
                                        line-height: 19.6px;
                                      "><em style="line-height: inherit;"><span style="
                                            font-size: 16px;
                                            line-height: 22.4px;
                                          ">Please ignore this email if you did
                                          not request a password change.<br style="line-height: inherit;"><span style="
                                        color: #888888;
                                        font-size: 14px;
                                        line-height: 19.6px;
                                      "></span></span></em><em style="line-height: inherit;"><span style="
                                            font-size: 16px;
                                            line-height: 22.4px;
                                          ">&nbsp;
                                  </span></em></span></p>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        <!--[if (!mso)&(!IE)]><!-->
                      </div>
                      <!--<![endif]-->
                    </div>
                  </div>
                  <!--[if (mso)|(IE)]></td><![endif]-->
                  <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                </div>
              </div>
            </div>

            <div class="u-row-container" style="padding: 0px;background-color: transparent;line-height: inherit;">
              <div class="u-row" style="margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #18163a;line-height: inherit;width: 100% !important;">
                <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;line-height: inherit;">
                  <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #18163a;"><![endif]-->

                  <!--[if (mso)|(IE)]><td align="center" width="300" style="width: 300px;padding: 20px 20px 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                  <div class="u-col u-col-50" style="max-width: 320px;min-width: 300px;display: table-cell;vertical-align: top;line-height: inherit;width: 300px !important;">
                    <div style="height: 100%;width: 100% !important;line-height: inherit;margin: 0 auto;">
                      <!--[if (!mso)&(!IE)]><!--><div style="box-sizing: border-box;height: 100%;padding: 20px 20px 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;line-height: inherit;"><!--<![endif]-->
                        <table style="font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                          <tbody style="line-height: inherit;">
                            <tr style="line-height: inherit;vertical-align: top;border-collapse: collapse;">
                              <td style="overflow-wrap: break-word;word-break: break-word;padding: 10px;font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" align="left">
                                <div style="
                                    font-size: 14px;
                                    line-height: 140%;
                                    text-align: left;
                                    word-wrap: break-word;
                                  ">
                                  <p style="font-size: 14px;line-height: 140%;margin: 0;">
                                    <span style="
                                        font-size: 16px;
                                        line-height: 22.4px;
                                        color: #ecf0f1;
                                      ">Contact
                                  </span></p>
                                  <p style="font-size: 14px;line-height: 140%;margin: 0;">
                                    <span style="
                                        font-size: 14px;
                                        line-height: 19.6px;
                                        color: #ecf0f1;
                                      ">1 (833) 348-7671
                                  </span></p>
                                  <p style="font-size: 14px;line-height: 140%;margin: 0;">
                                    <span style="font-size: 14px; line-height: 19.6px; color: #ecf0f1;">
  <a href="mailto:support@divinepos.com" style="color: #ecf0f1;text-decoration: none;line-height: inherit;">support@divinepos.com</a>
</span>
                                  </p>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        <!--[if (!mso)&(!IE)]><!-->
                      </div>
                      <!--<![endif]-->
                    </div>
                  </div>
                  <!--[if (mso)|(IE)]></td><![endif]-->
                  <!--[if (mso)|(IE)]><td align="center" width="300" style="width: 300px;padding: 0px 0px 0px 20px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                  <div class="u-col u-col-50" style="max-width: 320px;min-width: 300px;display: table-cell;vertical-align: top;line-height: inherit;width: 300px !important;">
                    <div style="height: 100%;width: 100% !important;line-height: inherit;margin: 0 auto;">
                      <!--[if (!mso)&(!IE)]><!--><div style="box-sizing: border-box;height: 100%;padding: 0px 0px 0px 20px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;line-height: inherit;"><!--<![endif]-->
                        <table style="font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                          <tbody style="line-height: inherit;">
                            <tr style="line-height: inherit;vertical-align: top;border-collapse: collapse;">
                              <td style="overflow-wrap: break-word;word-break: break-word;padding: 25px 10px 10px;font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" align="left">
                                <div align="left" style="line-height: inherit;">
                                  <div style="display: table;max-width: 140px;line-height: inherit;">
                                    <!--[if (mso)|(IE)]><table width="140" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-collapse:collapse;" align="left"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse; mso-table-lspace: 0pt;mso-table-rspace: 0pt; width:140px;"><tr><![endif]-->

                                    <!--[if (mso)|(IE)]><td width="32" style="width:32px; padding-right: 15px;" valign="top"><![endif]-->
                                    <table align="left" border="0" cellspacing="0" cellpadding="0" width="32" height="32" style="width: 32px !important;height: 32px !important;display: inline-block;border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;margin-right: 15px;line-height: inherit;color: #000000;">
                                      <tbody style="line-height: inherit;">
                                        <tr style="vertical-align: top;line-height: inherit;border-collapse: collapse;">
                                          <td align="left" valign="middle" style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;line-height: inherit;color: #000000;">
                                            <a href=" https://www.facebook.com/divinepos" title="Facebook" target="_blank" style="line-height: inherit;color: #161a39;text-decoration: underline;">
                                              <img
                                              src="https://drive.usercontent.google.com/download?id=1ztDO1YYb7VGlXXnVvFmuXhC5-fUmYy2U"
                                              alt="Facebook" title="Facebook" width="32" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: block !important;border: none;height: auto;float: none;max-width: 32px !important;line-height: inherit;">
                                            </a>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                    <!--[if (mso)|(IE)]></td><![endif]-->

                                    <!--[if (mso)|(IE)]><td width="32" style="width:32px; padding-right: 15px;" valign="top"><![endif]-->
                                    <table align="left" border="0" cellspacing="0" cellpadding="0" width="32" height="32" style="width: 32px !important;height: 32px !important;display: inline-block;border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;margin-right: 15px;line-height: inherit;color: #000000;">
                                      <tbody style="line-height: inherit;">
                                        <tr style="vertical-align: top;line-height: inherit;border-collapse: collapse;">
                                          <td align="left" valign="middle" style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;line-height: inherit;color: #000000;">
                                            <a href=" https://twitter.com/divine_pos" title="Twitter" target="_blank" style="line-height: inherit;color: #161a39;text-decoration: underline;">
                                              <img
                                              src="https://drive.usercontent.google.com/download?id=1xKZwgFBoZlRX-G1p11NP9IMuTfVahMbz"
                                              alt="Twitter" title="Twitter" width="32" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: block !important;border: none;height: auto;float: none;max-width: 32px !important;line-height: inherit;">
                                            </a>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                    <!--[if (mso)|(IE)]></td><![endif]-->

                                    <!--[if (mso)|(IE)]><td width="32" style="width:32px; padding-right: 0px;" valign="top"><![endif]-->
                                    <table align="left" border="0" cellspacing="0" cellpadding="0" width="32" height="32" style="width: 32px !important;height: 32px !important;display: inline-block;border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;margin-right: 0px;line-height: inherit;color: #000000;">
                                      <tbody style="line-height: inherit;">
                                        <tr style="vertical-align: top;line-height: inherit;border-collapse: collapse;">
                                          <td align="left" valign="middle" style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;line-height: inherit;color: #000000;">
                                            <a href=" https://www.linkedin.com/company/divinepos" title="LinkedIn" target="_blank" style="line-height: inherit;color: #161a39;text-decoration: underline;">
                                              <img
                                              src="https://drive.usercontent.google.com/download?id=158hro6-R56oDvPeo1ib9EADt5mJt5J4L"
                                              alt="LinkedIn" title="LinkedIn" width="32" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: block !important;border: none;height: auto;float: none;max-width: 32px !important;line-height: inherit;">
                                            </a>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                    <!--[if (mso)|(IE)]></td><![endif]-->

                                    <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                                  </div>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        <table style="font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                          <tbody style="line-height: inherit;">
                            <tr style="line-height: inherit;vertical-align: top;border-collapse: collapse;">
                              <td style="overflow-wrap: break-word;word-break: break-word;padding: 5px 10px 10px;font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" align="left">
                                <div style="
                                    font-size: 14px;
                                    line-height: 140%;
                                    text-align: left;
                                    word-wrap: break-word;
                                  ">
                                  <p style="line-height: 140%;font-size: 14px;margin: 0;">
                                    <span style="
                                        font-size: 14px;
                                        line-height: 19.6px;
                                      "><span style="
                                          color: #ecf0f1;
                                          font-size: 14px;
                                          line-height: 19.6px;
                                        "><span style="
                                            line-height: 19.6px;
                                            font-size: 14px;
                                          ">Divine POS © All Rights
                                          Reserved
                                  </span></span></span></p>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        <!--[if (!mso)&(!IE)]><!-->
                      </div>
                      <!--<![endif]-->
                    </div>
                  </div>
                  <!--[if (mso)|(IE)]></td><![endif]-->
                  <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                </div>
              </div>
            </div>

            <div class="u-row-container" style="padding: 0px;background-color: #f9f9f9;line-height: inherit;">
              <div class="u-row" style="margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #1c103b;line-height: inherit;width: 100% !important;">
                <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;line-height: inherit;">
                  <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: #f9f9f9;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #1c103b;"><![endif]-->

                  <!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                  <div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;line-height: inherit;width: 600px !important;">
                    <div style="height: 100%;width: 100% !important;line-height: inherit;margin: 0 auto;">
                      <!--[if (!mso)&(!IE)]><!--><div style="box-sizing: border-box;height: 100%;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;line-height: inherit;"><!--<![endif]-->
                        <table style="font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                          <tbody style="line-height: inherit;">
                            <tr style="line-height: inherit;vertical-align: top;border-collapse: collapse;">
                              <td style="overflow-wrap: break-word;word-break: break-word;padding: 15px;font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" align="left">
                                <table height="0px" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;border-top: 1px solid #1c103b;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;line-height: inherit;color: #000000;">
                                  <tbody style="line-height: inherit;">
                                    <tr style="vertical-align: top;line-height: inherit;border-collapse: collapse;">
                                      <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;font-size: 0px;line-height: 0px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;color: #000000;">
                                        <span style="line-height: inherit;">&#160;</span>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        <!--[if (!mso)&(!IE)]><!-->
                      </div>
                      <!--<![endif]-->
                    </div>
                  </div>
                  <!--[if (mso)|(IE)]></td><![endif]-->
                  <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                </div>
              </div>
            </div>

            <div class="u-row-container" style="padding: 0px;background-color: transparent;line-height: inherit;">
              <div class="u-row" style="margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #f9f9f9;line-height: inherit;width: 100% !important;">
                <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;line-height: inherit;">
                  <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #f9f9f9;"><![endif]-->

                  <!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                  <div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;line-height: inherit;width: 600px !important;">
                    <div style="height: 100%;width: 100% !important;line-height: inherit;margin: 0 auto;">
                      <!--[if (!mso)&(!IE)]><!--><div style="box-sizing: border-box;height: 100%;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;line-height: inherit;"><!--<![endif]-->
                        <table style="font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                          <tbody style="line-height: inherit;">
                            <tr style="line-height: inherit;vertical-align: top;border-collapse: collapse;">
                              <td style="overflow-wrap: break-word;word-break: break-word;padding: 0px 40px 30px 20px;font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" align="left">
                                <div style="
                                    font-size: 14px;
                                    line-height: 140%;
                                    text-align: left;
                                    word-wrap: break-word;
                                  "></div>
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        <!--[if (!mso)&(!IE)]><!-->
                      </div>
                      <!--<![endif]-->
                    </div>
                  </div>
                  <!--[if (mso)|(IE)]></td><![endif]-->
                  <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                </div>
              </div>
            </div>

            <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
          </td>
        </tr>
      </tbody>
    </table>
    <!--[if mso]></div><![endif]-->
    <!--[if IE]></div><![endif]-->
  </body>
</html>
  `;
};

const SettingsPasswordEmailHtml = (password) => {
  return `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" style="line-height: inherit;">
  <head style="line-height: inherit;">
    <!--[if gte mso 9]>
      <xml>
        <o:OfficeDocumentSettings>
          <o:AllowPNG />
          <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
      </xml>
    <![endif]-->
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" style="line-height: inherit;">
    <meta name="viewport" content="width=device-width, initial-scale=1.0" style="line-height: inherit;">
    <meta name="x-apple-disable-message-reformatting" style="line-height: inherit;">
    <!--[if !mso]><!-->
    <meta http-equiv="X-UA-Compatible" content="IE=edge" style="line-height: inherit;">
    <!--<![endif]-->
    <title style="line-height: inherit;"></title>


    <!--[if !mso]><!-->
    <!--<![endif]-->
  </head>

  <body class="clean-body u_body" style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #f9f9f9;color: #000000;line-height: inherit;">
    <!--[if IE]><div class="ie-container"><![endif]-->
    <!--[if mso]><div class="mso-container"><![endif]-->
    <table id="u_body" style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;margin: 0 auto;background-color: #f9f9f9;width: 100%;line-height: inherit;color: #000000;" cellpadding="0" cellspacing="0">
      <tbody style="line-height: inherit;">
        <tr style="vertical-align: top;line-height: inherit;border-collapse: collapse;">
          <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;line-height: inherit;color: #000000;">
            <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="background-color: #f9f9f9;"><![endif]-->

            <div class="u-row-container" style="padding: 0px;background-color: #f9f9f9;line-height: inherit;">
              <div class="u-row" style="margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #f9f9f9;line-height: inherit;width: 100% !important;">
                <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;line-height: inherit;">
                  <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: #f9f9f9;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #f9f9f9;"><![endif]-->

                  <!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                  <div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;line-height: inherit;width: 600px !important;">
                    <div style="height: 100%;width: 100% !important;line-height: inherit;margin: 0 auto;">
                      <!--[if (!mso)&(!IE)]><!--><div style="box-sizing: border-box;height: 100%;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;line-height: inherit;"><!--<![endif]-->
                        <table style="font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                          <tbody style="line-height: inherit;">
                            <tr style="line-height: inherit;vertical-align: top;border-collapse: collapse;">
                              <td style="overflow-wrap: break-word;word-break: break-word;padding: 15px;font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" align="left">
                                <table height="0px" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;border-top: 1px solid #f9f9f9;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;line-height: inherit;color: #000000;">
                                  <tbody style="line-height: inherit;">
                                    <tr style="vertical-align: top;line-height: inherit;border-collapse: collapse;">
                                      <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;font-size: 0px;line-height: 0px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;color: #000000;">
                                        <span style="line-height: inherit;">&#160;</span>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        <!--[if (!mso)&(!IE)]><!-->
                      </div>
                      <!--<![endif]-->
                    </div>
                  </div>
                  <!--[if (mso)|(IE)]></td><![endif]-->
                  <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                </div>
              </div>
            </div>

            <div class="u-row-container" style="padding: 0px;background-color: transparent;line-height: inherit;">
              <div class="u-row" style="margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #ffffff;line-height: inherit;width: 100% !important;">
                <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;line-height: inherit;">
                  <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #ffffff;"><![endif]-->

                  <!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                  <div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;line-height: inherit;width: 600px !important;">
                    <div style="height: 100%;width: 100% !important;line-height: inherit;margin: 0 auto;">
                      <!--[if (!mso)&(!IE)]><!--><div style="box-sizing: border-box;height: 100%;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;line-height: inherit;"><!--<![endif]-->
                        <table style="font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                          <tbody style="line-height: inherit;">
                            <tr style="line-height: inherit;vertical-align: top;border-collapse: collapse;">
                              <td style="overflow-wrap: break-word;word-break: break-word;padding: 25px 10px;font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" align="left">
                                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;">
                                  <tr style="line-height: inherit;vertical-align: top;border-collapse: collapse;">
                                    <td style="padding-right: 0px;padding-left: 0px;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" align="center">
                                      <img src="https://drive.usercontent.google.com/download?id=1r7_iRR9PuWgLGl4RyQXg9t_FLrYnlfcm"
                                      alt="DPOS Logo" title="DPOS Logo" style="outline: none;text-decoration: none;display: inline-block;height: auto;width: 168px;/* fixed width for consistency */
    max-width: 100%;/* ensures responsiveness */: ;line-height: inherit;" width="168">
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        <!--[if (!mso)&(!IE)]><!-->
                      </div>
                      <!--<![endif]-->
                    </div>
                  </div>
                  <!--[if (mso)|(IE)]></td><![endif]-->
                  <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                </div>
              </div>
            </div>

            <div class="u-row-container" style="padding: 0px;background-color: transparent;line-height: inherit;">
              <div class="u-row" style="margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #161a39;line-height: inherit;width: 100% !important;">
                <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;line-height: inherit;">
                  <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #161a39;"><![endif]-->

                  <!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                  <div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;line-height: inherit;width: 600px !important;">
                    <div style="height: 100%;width: 100% !important;line-height: inherit;margin: 0 auto;">
                      <!--[if (!mso)&(!IE)]><!--><div style="box-sizing: border-box;height: 100%;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;line-height: inherit;"><!--<![endif]-->
                        <table style="font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                          <tbody style="line-height: inherit;">
                            <tr style="line-height: inherit;vertical-align: top;border-collapse: collapse;">
                              <td style="overflow-wrap: break-word;word-break: break-word;padding: 35px 10px 10px;font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" align="left">
                                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;">
                                  <tr style="line-height: inherit;vertical-align: top;border-collapse: collapse;">
                                    <td style="padding-right: 0px;padding-left: 0px;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" align="center">
                                       <img align="center" border="0"
                                      src="https://drive.usercontent.google.com/download?id=191ZVe851C-M9uTp3e2H1DAZ2nyYqMBdP"
                                      alt="Image" title="Image" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 10%;max-width: 58px;line-height: inherit;" width="58">
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        <table style="font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                          <tbody style="line-height: inherit;">
                            <tr style="line-height: inherit;vertical-align: top;border-collapse: collapse;">
                              <td style="overflow-wrap: break-word;word-break: break-word;padding: 0px 10px 30px;font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" align="left">
                                <div style="
                                    font-size: 14px;
                                    line-height: 140%;
                                    text-align: left;
                                    word-wrap: break-word;
                                  ">
                                  <p style="font-size: 14px;line-height: 140%;text-align: center;margin: 0;">
                                    <span style="
                                        font-size: 28px;
                                        line-height: 39.2px;
                                        color: #ffffff;
                                        font-family: Lato, sans-serif;
                                      ">Divine POS System Backend Password
                                    </span>
                                  </p>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        <!--[if (!mso)&(!IE)]><!-->
                      </div>
                      <!--<![endif]-->
                    </div>
                  </div>
                  <!--[if (mso)|(IE)]></td><![endif]-->
                  <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                </div>
              </div>
            </div>

            <div class="u-row-container" style="padding: 0px;background-color: transparent;line-height: inherit;">
              <div class="u-row" style="margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #ffffff;line-height: inherit;width: 100% !important;">
                <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;line-height: inherit;">
                  <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #ffffff;"><![endif]-->

                  <!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                  <div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;line-height: inherit;width: 600px !important;">
                    <div style="height: 100%;width: 100% !important;line-height: inherit;margin: 0 auto;">
                      <!--[if (!mso)&(!IE)]><!--><div style="box-sizing: border-box;height: 100%;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;line-height: inherit;"><!--<![endif]-->
                        <table style="font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                          <tbody style="line-height: inherit;">
                            <tr style="line-height: inherit;vertical-align: top;border-collapse: collapse;">
                              <td style="overflow-wrap: break-word;word-break: break-word;padding: 40px 40px 30px;font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" align="left">
                                <div style="
                                    font-size: 14px;
                                    line-height: 140%;
                                    text-align: left;
                                    word-wrap: break-word;
                                  ">
                                  <p style="font-size: 14px;line-height: 140%;margin: 0;">
                                    <span style="
                                        font-size: 18px;
                                        line-height: 25.2px;
                                        color: #666666;
                                      ">Hello,
                                  </span></p>
                                  <p style="font-size: 14px;line-height: 140%;margin: 0;">
                                  </p>
                                  <p style="font-size: 14px;line-height: 140%;margin: 0;">
                                    <span style="
                                        font-size: 18px;
                                        line-height: 25.2px;
                                        color: #666666;
                                      ">We have sent you this email in response
                                      to your request for your Divine POS System Backend password.
                                  </span></p>
                                  <p style="font-size: 14px;line-height: 140%;margin: 0;">
                                  </p>
                                  <p style="font-size: 14px;line-height: 140%;margin: 0;">
                                    <span style="
                                        font-size: 18px;
                                        line-height: 25.2px;
                                        color: #666666;
                                      ">Settings Password: ${password}
                                    </span>
                                  </p>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        <table style="font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                          <tbody style="line-height: inherit;">
                            <tr style="line-height: inherit;vertical-align: top;border-collapse: collapse;">
                              <td style="overflow-wrap: break-word;word-break: break-word;padding: 0px 40px;font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" align="left">
                                <!--[if mso
                                  ]><style>
                                    .v-button {
                                      background: transparent !important;
                                    }
                                  </style><!
                                [endif]-->
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        <table style="font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                          <tbody style="line-height: inherit;">
                            <tr style="line-height: inherit;vertical-align: top;border-collapse: collapse;">
                              <td style="overflow-wrap: break-word;word-break: break-word;padding: 40px 40px 30px;font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" align="left">
                                <div style="
                                    font-size: 14px;
                                    line-height: 140%;
                                    text-align: left;
                                    word-wrap: break-word;
                                  ">
                                  <p style="font-size: 14px;line-height: 140%;margin: 0;">
                                    <span style="
                                        color: #888888;
                                        font-size: 14px;
                                        line-height: 19.6px;
                                      "><em style="line-height: inherit;"><span style="
                                            font-size: 16px;
                                            line-height: 22.4px;
                                          ">Please ignore this email if you did
                                          not request your password.<br style="line-height: inherit;"><span style="
                                        color: #888888;
                                        font-size: 14px;
                                        line-height: 19.6px;
                                      "></span></span></em><em style="line-height: inherit;"><span style="
                                            font-size: 16px;
                                            line-height: 22.4px;
                                          ">&nbsp;
                                  </span></em></span></p>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        <!--[if (!mso)&(!IE)]><!-->
                      </div>
                      <!--<![endif]-->
                    </div>
                  </div>
                  <!--[if (mso)|(IE)]></td><![endif]-->
                  <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                </div>
              </div>
            </div>

            <div class="u-row-container" style="padding: 0px;background-color: transparent;line-height: inherit;">
              <div class="u-row" style="margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #18163a;line-height: inherit;width: 100% !important;">
                <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;line-height: inherit;">
                  <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #18163a;"><![endif]-->

                  <!--[if (mso)|(IE)]><td align="center" width="300" style="width: 300px;padding: 20px 20px 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                  <div class="u-col u-col-50" style="max-width: 320px;min-width: 300px;display: table-cell;vertical-align: top;line-height: inherit;width: 300px !important;">
                    <div style="height: 100%;width: 100% !important;line-height: inherit;margin: 0 auto;">
                      <!--[if (!mso)&(!IE)]><!--><div style="box-sizing: border-box;height: 100%;padding: 20px 20px 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;line-height: inherit;"><!--<![endif]-->
                        <table style="font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                          <tbody style="line-height: inherit;">
                            <tr style="line-height: inherit;vertical-align: top;border-collapse: collapse;">
                              <td style="overflow-wrap: break-word;word-break: break-word;padding: 10px;font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" align="left">
                                <div style="
                                    font-size: 14px;
                                    line-height: 140%;
                                    text-align: left;
                                    word-wrap: break-word;
                                  ">
                                  <p style="font-size: 14px;line-height: 140%;margin: 0;">
                                    <span style="
                                        font-size: 16px;
                                        line-height: 22.4px;
                                        color: #ecf0f1;
                                      ">Contact
                                  </span></p>
                                  <p style="font-size: 14px;line-height: 140%;margin: 0;">
                                    <span style="
                                        font-size: 14px;
                                        line-height: 19.6px;
                                        color: #ecf0f1;
                                      ">1 (833) 348-7671
                                  </span></p>
                                  <p style="font-size: 14px;line-height: 140%;margin: 0;">
                                    <span style="font-size: 14px; line-height: 19.6px; color: #ecf0f1;">
  <a href="mailto:support@divinepos.com" style="color: #ecf0f1;text-decoration: none;line-height: inherit;">support@divinepos.com</a>
</span>
                                  </p>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        <!--[if (!mso)&(!IE)]><!-->
                      </div>
                      <!--<![endif]-->
                    </div>
                  </div>
                  <!--[if (mso)|(IE)]></td><![endif]-->
                  <!--[if (mso)|(IE)]><td align="center" width="300" style="width: 300px;padding: 0px 0px 0px 20px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                  <div class="u-col u-col-50" style="max-width: 320px;min-width: 300px;display: table-cell;vertical-align: top;line-height: inherit;width: 300px !important;">
                    <div style="height: 100%;width: 100% !important;line-height: inherit;margin: 0 auto;">
                      <!--[if (!mso)&(!IE)]><!--><div style="box-sizing: border-box;height: 100%;padding: 0px 0px 0px 20px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;line-height: inherit;"><!--<![endif]-->
                        <table style="font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                          <tbody style="line-height: inherit;">
                            <tr style="line-height: inherit;vertical-align: top;border-collapse: collapse;">
                              <td style="overflow-wrap: break-word;word-break: break-word;padding: 25px 10px 10px;font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" align="left">
                                <div align="left" style="line-height: inherit;">
                                  <div style="display: table;max-width: 140px;line-height: inherit;">
                                    <!--[if (mso)|(IE)]><table width="140" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-collapse:collapse;" align="left"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse; mso-table-lspace: 0pt;mso-table-rspace: 0pt; width:140px;"><tr><![endif]-->

                                    <!--[if (mso)|(IE)]><td width="32" style="width:32px; padding-right: 15px;" valign="top"><![endif]-->
                                    <table align="left" border="0" cellspacing="0" cellpadding="0" width="32" height="32" style="width: 32px !important;height: 32px !important;display: inline-block;border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;margin-right: 15px;line-height: inherit;color: #000000;">
                                      <tbody style="line-height: inherit;">
                                        <tr style="vertical-align: top;line-height: inherit;border-collapse: collapse;">
                                          <td align="left" valign="middle" style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;line-height: inherit;color: #000000;">
                                            <a href=" https://www.facebook.com/divinepos" title="Facebook" target="_blank" style="line-height: inherit;color: #161a39;text-decoration: underline;">
                                              <img
                                              src="https://drive.usercontent.google.com/download?id=1ztDO1YYb7VGlXXnVvFmuXhC5-fUmYy2U"
                                              alt="Facebook" title="Facebook" width="32" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: block !important;border: none;height: auto;float: none;max-width: 32px !important;line-height: inherit;">
                                            </a>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                    <!--[if (mso)|(IE)]></td><![endif]-->

                                    <!--[if (mso)|(IE)]><td width="32" style="width:32px; padding-right: 15px;" valign="top"><![endif]-->
                                    <table align="left" border="0" cellspacing="0" cellpadding="0" width="32" height="32" style="width: 32px !important;height: 32px !important;display: inline-block;border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;margin-right: 15px;line-height: inherit;color: #000000;">
                                      <tbody style="line-height: inherit;">
                                        <tr style="vertical-align: top;line-height: inherit;border-collapse: collapse;">
                                          <td align="left" valign="middle" style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;line-height: inherit;color: #000000;">
                                            <a href=" https://twitter.com/divine_pos" title="Twitter" target="_blank" style="line-height: inherit;color: #161a39;text-decoration: underline;">
                                               <img
                                              src="https://drive.usercontent.google.com/download?id=1xKZwgFBoZlRX-G1p11NP9IMuTfVahMbz"
                                              alt="Twitter" title="Twitter" width="32" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: block !important;border: none;height: auto;float: none;max-width: 32px !important;line-height: inherit;">
                                            </a>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                    <!--[if (mso)|(IE)]></td><![endif]-->

                                    <!--[if (mso)|(IE)]><td width="32" style="width:32px; padding-right: 0px;" valign="top"><![endif]-->
                                    <table align="left" border="0" cellspacing="0" cellpadding="0" width="32" height="32" style="width: 32px !important;height: 32px !important;display: inline-block;border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;margin-right: 0px;line-height: inherit;color: #000000;">
                                      <tbody style="line-height: inherit;">
                                        <tr style="vertical-align: top;line-height: inherit;border-collapse: collapse;">
                                          <td align="left" valign="middle" style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;line-height: inherit;color: #000000;">
                                            <a href=" https://www.linkedin.com/company/divinepos" title="LinkedIn" target="_blank" style="line-height: inherit;color: #161a39;text-decoration: underline;">
                                              <img
                                              src="https://drive.usercontent.google.com/download?id=158hro6-R56oDvPeo1ib9EADt5mJt5J4L"
                                              alt="LinkedIn" title="LinkedIn" width="32" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: block !important;border: none;height: auto;float: none;max-width: 32px !important;line-height: inherit;">
                                            </a>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                    <!--[if (mso)|(IE)]></td><![endif]-->

                                    <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                                  </div>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        <table style="font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                          <tbody style="line-height: inherit;">
                            <tr style="line-height: inherit;vertical-align: top;border-collapse: collapse;">
                              <td style="overflow-wrap: break-word;word-break: break-word;padding: 5px 10px 10px;font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" align="left">
                                <div style="
                                    font-size: 14px;
                                    line-height: 140%;
                                    text-align: left;
                                    word-wrap: break-word;
                                  ">
                                  <p style="line-height: 140%;font-size: 14px;margin: 0;">
                                    <span style="
                                        font-size: 14px;
                                        line-height: 19.6px;
                                      "><span style="
                                          color: #ecf0f1;
                                          font-size: 14px;
                                          line-height: 19.6px;
                                        "><span style="
                                            line-height: 19.6px;
                                            font-size: 14px;
                                          ">Divine POS © All Rights
                                          Reserved
                                  </span></span></span></p>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        <!--[if (!mso)&(!IE)]><!-->
                      </div>
                      <!--<![endif]-->
                    </div>
                  </div>
                  <!--[if (mso)|(IE)]></td><![endif]-->
                  <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                </div>
              </div>
            </div>

            <div class="u-row-container" style="padding: 0px;background-color: #f9f9f9;line-height: inherit;">
              <div class="u-row" style="margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #1c103b;line-height: inherit;width: 100% !important;">
                <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;line-height: inherit;">
                  <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: #f9f9f9;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #1c103b;"><![endif]-->

                  <!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                  <div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;line-height: inherit;width: 600px !important;">
                    <div style="height: 100%;width: 100% !important;line-height: inherit;margin: 0 auto;">
                      <!--[if (!mso)&(!IE)]><!--><div style="box-sizing: border-box;height: 100%;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;line-height: inherit;"><!--<![endif]-->
                        <table style="font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                          <tbody style="line-height: inherit;">
                            <tr style="line-height: inherit;vertical-align: top;border-collapse: collapse;">
                              <td style="overflow-wrap: break-word;word-break: break-word;padding: 15px;font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" align="left">
                                <table height="0px" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;border-top: 1px solid #1c103b;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;line-height: inherit;color: #000000;">
                                  <tbody style="line-height: inherit;">
                                    <tr style="vertical-align: top;line-height: inherit;border-collapse: collapse;">
                                      <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;font-size: 0px;line-height: 0px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;color: #000000;">
                                        <span style="line-height: inherit;">&#160;</span>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        <!--[if (!mso)&(!IE)]><!-->
                      </div>
                      <!--<![endif]-->
                    </div>
                  </div>
                  <!--[if (mso)|(IE)]></td><![endif]-->
                  <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                </div>
              </div>
            </div>

            <div class="u-row-container" style="padding: 0px;background-color: transparent;line-height: inherit;">
              <div class="u-row" style="margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #f9f9f9;line-height: inherit;width: 100% !important;">
                <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;line-height: inherit;">
                  <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #f9f9f9;"><![endif]-->

                  <!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                  <div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;line-height: inherit;width: 600px !important;">
                    <div style="height: 100%;width: 100% !important;line-height: inherit;margin: 0 auto;">
                      <!--[if (!mso)&(!IE)]><!--><div style="box-sizing: border-box;height: 100%;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;line-height: inherit;"><!--<![endif]-->
                        <table style="font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                          <tbody style="line-height: inherit;">
                            <tr style="line-height: inherit;vertical-align: top;border-collapse: collapse;">
                              <td style="overflow-wrap: break-word;word-break: break-word;padding: 0px 40px 30px 20px;font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" align="left">
                                <div style="
                                    font-size: 14px;
                                    line-height: 140%;
                                    text-align: left;
                                    word-wrap: break-word;
                                  "></div>
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        <!--[if (!mso)&(!IE)]><!-->
                      </div>
                      <!--<![endif]-->
                    </div>
                  </div>
                  <!--[if (mso)|(IE)]></td><![endif]-->
                  <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                </div>
              </div>
            </div>

            <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
          </td>
        </tr>
      </tbody>
    </table>
    <!--[if mso]></div><![endif]-->
    <!--[if IE]></div><![endif]-->
  </body>
</html>
    `;
};

const OrderConfirmationEmailHtml = (element, storeDetails) => {
  let emailData = `
  <!DOCTYPE html>
<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">

<head>
	<title></title>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0"><!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]--><!--[if !mso]><!-->
	<link href="https://fonts.googleapis.com/css?family=Montserrat" rel="stylesheet" type="text/css"><!--<![endif]-->
	<style>
		* {
			box-sizing: border-box;
		}

		body {
			margin: 0;
			padding: 0;
		}

		a[x-apple-data-detectors] {
			color: inherit !important;
			text-decoration: inherit !important;
		}

		#MessageViewBody a {
			color: inherit;
			text-decoration: none;
		}

		p {
			line-height: inherit
		}

		.desktop_hide,
		.desktop_hide table {
			mso-hide: all;
			display: none;
			max-height: 0px;
			overflow: hidden;
		}

		.image_block img+div {
			display: none;
		}

		@media (max-width:660px) {
			.desktop_hide table.icons-inner {
				display: inline-block !important;
			}

			.icons-inner {
				text-align: center;
			}

			.icons-inner td {
				margin: 0 auto;
			}

			.image_block div.fullWidth {
				max-width: 100% !important;
			}

			.mobile_hide {
				display: none;
			}

			.row-content {
				width: 100% !important;
			}

			.stack .column {
				width: 100%;
				display: block;
			}

			.mobile_hide {
				min-height: 0;
				max-height: 0;
				max-width: 0;
				overflow: hidden;
				font-size: 0px;
			}

			.desktop_hide,
			.desktop_hide table {
				display: table !important;
				max-height: none !important;
			}
		}
	</style>
</head>

<body style="background-color: #e5e5e5; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
	<table class="nl-container" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #e5e5e5;">
		<tbody>
			<tr>
				<td>
					<table class="row row-1" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
						<tbody>
							<tr>
								<td>
									<table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 640px; margin: 0 auto;" width="640">
										<tbody>
											<tr>
												<td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
													<table class="empty_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
														<tr>
															<td class="pad">
																<div></div>
															</td>
														</tr>
													</table>
												</td>
											</tr>
										</tbody>
									</table>
								</td>
							</tr>
						</tbody>
					</table>
					<table class="row row-2" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-size: auto;">
						<tbody>
							<tr>
								<td>
									<table class="row-content" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-size: auto; background-color: #1d294e; color: #000000; width: 640px; margin: 0 auto;" width="640">
										<tbody>
											<tr>
												<td class="column column-1" width="16.666666666666668%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
													<div class="spacer_block block-1" style="height:285px;line-height:285px;font-size:1px;">&#8202;</div>
												</td>
												<td class="column column-2" width="66.66666666666667%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
													<div class="spacer_block block-1" style="height:100px;line-height:100px;font-size:1px;">&#8202;</div>
													<table class="paragraph_block block-2" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
														<tr>
															<td class="pad" style="padding-bottom:10px;padding-left:10px;padding-right:10px;padding-top:15px;">
																<div style="color:#ffffff;font-family:Montserrat, Trebuchet MS, Lucida Grande, Lucida Sans Unicode, Lucida Sans, Tahoma, sans-serif;font-size:24px;line-height:120%;text-align:center;mso-line-height-alt:28.799999999999997px;">
																	<p style="margin: 0; word-break: break-word;"><span>${element.customer.name.toUpperCase()}, thanks for your order!</span></p>
																</div>
															</td>
														</tr>
													</table>
													<table class="paragraph_block block-3" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
														<tr>
															<td class="pad">
																<div style="color:#ffffff;font-family:Montserrat, Trebuchet MS, Lucida Grande, Lucida Sans Unicode, Lucida Sans, Tahoma, sans-serif;font-size:24px;line-height:120%;text-align:center;mso-line-height-alt:28.799999999999997px;">
																	<p style="margin: 0; word-break: break-word;"><span>${element.date
                                    .slice(0, 16)
                                    .replace("T", " ")}</span></p>
																</div>
															</td>
														</tr>
													</table>
													<div class="spacer_block block-4" style="height:30px;line-height:30px;font-size:1px;">&#8202;</div>
													<table class="paragraph_block block-5" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
														<tr>
															<td class="pad">
																<div style="color:#ffffff;font-family:Montserrat, Trebuchet MS, Lucida Grande, Lucida Sans Unicode, Lucida Sans, Tahoma, sans-serif;font-size:24px;line-height:120%;text-align:center;mso-line-height-alt:28.799999999999997px;">
																	<p style="margin: 0; word-break: break-word;"><span>${
                                    storeDetails.name
                                  }</span></p>
																	<p style="margin: 0; word-break: break-word;"><span>${
                                    storeDetails.address.label
                                  }</span></p>
																	<p style="margin: 0; word-break: break-word;"><span>${
                                    storeDetails.website
                                      ? storeDetails.website
                                      : ""
                                  }</span></p>
																	<p style="margin: 0; word-break: break-word;"><span>${
                                    storeDetails.phoneNumber
                                      ? storeDetails.phoneNumber
                                      : ""
                                  }</span></p>
																</div>
															</td>
														</tr>
													</table>
													<div class="spacer_block block-6" style="height:30px;line-height:30px;font-size:1px;">&#8202;</div>
												</td>
												<td class="column column-3" width="16.666666666666668%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
													<div class="spacer_block block-1" style="height:285px;line-height:285px;font-size:1px;">&#8202;</div>
												</td>
											</tr>
										</tbody>
									</table>
								</td>
							</tr>
						</tbody>
					</table>
					<table class="row row-3" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
						<tbody>
							<tr>
								<td>
									<table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #1d294e; color: #000000; width: 640px; margin: 0 auto;" width="640">
										<tbody>
											<tr>
												<td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; border-left: 25px solid transparent; border-right: 24px solid transparent; vertical-align: top; border-top: 0px; border-bottom: 0px;">
													<div class="spacer_block block-1" style="height:30px;line-height:30px;font-size:1px;">&#8202;</div>
													<table class="image_block block-2" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
														<tr>
															<td class="pad" style="width:100%;padding-right:0px;padding-left:0px;">
																<div class="alignment" align="center" style="line-height:10px">
																	<div class="fullWidth" style="max-width: 591px;"><img src="https://d1oco4z2z1fhwp.cloudfront.net/templates/default/2571/receipt-top.png" style="display: block; height: auto; border: 0; width: 100%;" width="591" alt="Alternate text" title="Alternate text" height="auto"></div>
																</div>
															</td>
														</tr>
													</table>
												</td>
											</tr>
										</tbody>
									</table>
								</td>
							</tr>
						</tbody>
					</table>
					<table class="row row-4" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
						<tbody>
							<tr>
								<td>
									<table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f2f2f2; color: #000000; width: 640px; margin: 0 auto;" width="640">
										<tbody>
											<tr>
												<td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; border-left: 25px solid #1d294e; border-right: 25px solid #1d294e; vertical-align: top; border-top: 0px; border-bottom: 0px;">
													<div class="spacer_block block-1" style="height:20px;line-height:20px;font-size:1px;">&#8202;</div>
												</td>
											</tr>
										</tbody>
									</table>
								</td>
							</tr>
						</tbody>
					</table>
  `;

  element.cart.map((cartItem) => {
    let optionsString = "";

    if (cartItem.options) {
      cartItem.options.map((option) => {
        optionsString += `${option}<br>`;
      });
    }

    emailData += `
    <table class="row row-5" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
						<tbody>
							<tr>
								<td>
									<table class="row-content" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #1d294e; color: #000000; width: 640px; margin: 0 auto;" width="640">
										<tbody>
											<tr>
												<td class="column column-1" width="66.66666666666667%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; background-color: #f2f2f2; border-left: 25px solid #1d294e; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px;">
													<div class="spacer_block block-1" style="height:15px;line-height:15px;font-size:1px;">&#8202;</div>
													<table class="paragraph_block block-2" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
														<tr>
															<td class="pad" style="padding-bottom:10px;padding-left:30px;padding-right:10px;padding-top:10px;">
																<div style="color:#232323;font-family:Montserrat, Trebuchet MS, Lucida Grande, Lucida Sans Unicode, Lucida Sans, Tahoma, sans-serif;font-size:16px;line-height:120%;text-align:left;mso-line-height-alt:19.2px;">
																	<p style="margin: 0; word-break: break-word;"><span><strong><span>${
                                    cartItem.quantity > 0
                                      ? `${cartItem.quantity} X `
                                      : ""
                                  }${cartItem.name}</span></strong></span></p>
																</div>
															</td>
														</tr>
													</table>
													<table class="paragraph_block block-3" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
														<tr>
															<td class="pad" style="padding-bottom:10px;padding-left:30px;padding-right:10px;">
																<div style="color:#232323;font-family:Montserrat, Trebuchet MS, Lucida Grande, Lucida Sans Unicode, Lucida Sans, Tahoma, sans-serif;font-size:14px;line-height:120%;text-align:left;mso-line-height-alt:16.8px;">
																	<p style="margin: 0; word-break: break-word;"><span><span>${optionsString}</span></span></p>
																</div>
															</td>
														</tr>
													</table>
												</td>
												<td class="column column-2" width="33.333333333333336%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; background-color: #f2f2f2; border-right: 25px solid #1d294e; vertical-align: top; border-top: 0px; border-bottom: 0px; border-left: 0px;">
													<div class="spacer_block block-1 mobile_hide" style="height:15px;line-height:15px;font-size:1px;">&#8202;</div>
													<table class="paragraph_block block-2" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
														<tr>
															<td class="pad" style="padding-bottom:10px;padding-right:30px;padding-top:10px;">
																<div style="color:#555555;font-family:Montserrat, Trebuchet MS, Lucida Grande, Lucida Sans Unicode, Lucida Sans, Tahoma, sans-serif;font-size:16px;line-height:120%;text-align:right;mso-line-height-alt:19.2px;">
																	<p style="margin: 0; word-break: break-word;"><span>$ ${parseFloat(
                                    cartItem.price,
                                  ).toFixed(2)}</span></p>
																</div>
															</td>
														</tr>
													</table>
													<div class="spacer_block block-3" style="height:29px;line-height:29px;font-size:1px;">&#8202;</div>
												</td>
											</tr>
										</tbody>
									</table>
								</td>
							</tr>
						</tbody>
					</table>
    `;
  });

  emailData += `
  <table class="row row-7" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
						<tbody>
							<tr>
								<td>
									<table class="row-content" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #1d294e; color: #000000; width: 640px; margin: 0 auto;" width="640">
										<tbody>
											<tr>
												<td class="column column-1" width="66.66666666666667%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; background-color: #f2f2f2; border-left: 25px solid #1d294e; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px;">
													<div class="spacer_block block-1" style="height:15px;line-height:15px;font-size:1px;">&#8202;</div>
													<table class="paragraph_block block-2" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
														<tr>
															<td class="pad" style="padding-bottom:10px;padding-left:30px;padding-right:10px;padding-top:10px;">
																<div style="color:#232323;font-family:Montserrat, Trebuchet MS, Lucida Grande, Lucida Sans Unicode, Lucida Sans, Tahoma, sans-serif;font-size:16px;line-height:120%;text-align:left;mso-line-height-alt:19.2px;">
																	<p style="margin: 0; word-break: break-word;"><span><strong><span>CHEESY GARLIC BREAD</span></strong></span></p>
																</div>
															</td>
														</tr>
													</table>
													<table class="paragraph_block block-3" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
														<tr>
															<td class="pad" style="padding-bottom:10px;padding-left:30px;padding-right:10px;">
																<div style="color:#232323;font-family:Montserrat, Trebuchet MS, Lucida Grande, Lucida Sans Unicode, Lucida Sans, Tahoma, sans-serif;font-size:16px;line-height:120%;text-align:left;mso-line-height-alt:19.2px;">
																	<p style="margin: 0; word-break: break-word;"><span><span>red sauce, ranch, pesto</span></span></p>
																</div>
															</td>
														</tr>
													</table>
												</td>
												<td class="column column-2" width="33.333333333333336%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; background-color: #f2f2f2; border-right: 25px solid #1d294e; vertical-align: top; border-top: 0px; border-bottom: 0px; border-left: 0px;">
													<div class="spacer_block block-1 mobile_hide" style="height:15px;line-height:15px;font-size:1px;">&#8202;</div>
													<table class="paragraph_block block-2" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
														<tr>
															<td class="pad" style="padding-bottom:10px;padding-right:30px;padding-top:10px;">
																<div style="color:#555555;font-family:Montserrat, Trebuchet MS, Lucida Grande, Lucida Sans Unicode, Lucida Sans, Tahoma, sans-serif;font-size:16px;line-height:120%;text-align:right;mso-line-height-alt:19.2px;">
																	<p style="margin: 0; word-break: break-word;"><span>$ 4.49</span></p>
																</div>
															</td>
														</tr>
													</table>
													<div class="spacer_block block-3" style="height:29px;line-height:29px;font-size:1px;">&#8202;</div>
												</td>
											</tr>
										</tbody>
									</table>
								</td>
							</tr>
						</tbody>
					</table>
					<table class="row row-8" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
						<tbody>
							<tr>
								<td>
									<table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f2f2f2; color: #000000; width: 640px; margin: 0 auto;" width="640">
										<tbody>
											<tr>
												<td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; border-left: 25px solid #1d294e; border-right: 25px solid #1d294e; vertical-align: top; border-top: 0px; border-bottom: 0px;">
													<table class="divider_block block-1" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
														<tr>
															<td class="pad">
																<div class="alignment" align="center">
																	<table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
																		<tr>
																			<td class="divider_inner" style="font-size: 1px; line-height: 1px; border-top: 1px solid #BBBBBB;"><span>&#8202;</span></td>
																		</tr>
																	</table>
																</div>
															</td>
														</tr>
													</table>
												</td>
											</tr>
										</tbody>
									</table>
								</td>
							</tr>
						</tbody>
					</table>
          `;

  // if (element.delivery) {
  //   if (storeDetails.deliveryPrice) {
  //     emailData += `
  //     <table class="row row-9" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
  // 					<tbody>
  // 						<tr>
  // 							<td>
  // 								<table class="row-content" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #1d294e; color: #000000; width: 640px; margin: 0 auto;" width="640">
  // 									<tbody>
  // 										<tr>
  // 											<td class="column column-1" width="66.66666666666667%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; background-color: #f2f2f2; border-left: 25px solid #1d294e; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px;">
  // 												<table class="paragraph_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
  // 													<tr>
  // 														<td class="pad" style="padding-bottom:10px;padding-left:30px;padding-right:10px;padding-top:10px;">
  // 															<div style="color:#232323;font-family:Montserrat, Trebuchet MS, Lucida Grande, Lucida Sans Unicode, Lucida Sans, Tahoma, sans-serif;font-size:16px;line-height:120%;text-align:left;mso-line-height-alt:19.2px;">
  // 																<p style="margin: 0; word-break: break-word;"><span><span>Delivery</span></span></p>
  // 															</div>
  // 														</td>
  // 													</tr>
  // 												</table>
  // 											</td>
  // 											<td class="column column-2" width="33.333333333333336%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; background-color: #f2f2f2; border-right: 25px solid #1d294e; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-bottom: 0px; border-left: 0px;">
  // 												<table class="paragraph_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
  // 													<tr>
  // 														<td class="pad" style="padding-bottom:10px;padding-right:30px;padding-top:10px;">
  // 															<div style="color:#555555;font-family:Montserrat, Trebuchet MS, Lucida Grande, Lucida Sans Unicode, Lucida Sans, Tahoma, sans-serif;font-size:16px;line-height:120%;text-align:right;mso-line-height-alt:19.2px;">
  // 																<p style="margin: 0; word-break: break-word;"><span>$ ${storeDetails.deliveryPrice}</span></p>
  // 															</div>
  // 														</td>
  // 													</tr>
  // 												</table>
  // 											</td>
  // 										</tr>
  // 									</tbody>
  // 								</table>
  // 							</td>
  // 						</tr>
  // 					</tbody>
  // 				</table>
  //     `;
  //   }
  // }

  emailData += `
  <table class="row row-12" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
						<tbody>
							<tr>
								<td>
									<table class="row-content" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #1d294e; color: #000000; width: 640px; margin: 0 auto;" width="640">
										<tbody>
											<tr>
												<td class="column column-1" width="66.66666666666667%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; background-color: #f2f2f2; border-left: 25px solid #1d294e; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px;">
													<table class="paragraph_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
														<tr>
															<td class="pad" style="padding-bottom:10px;padding-left:30px;padding-right:10px;padding-top:10px;">
																<div style="color:#232323;font-family:Montserrat, Trebuchet MS, Lucida Grande, Lucida Sans Unicode, Lucida Sans, Tahoma, sans-serif;font-size:16px;line-height:120%;text-align:left;mso-line-height-alt:19.2px;">
																	<p style="margin: 0; word-break: break-word;"><strong><span><span>TOTAL</span></span></strong></p>
																</div>
															</td>
														</tr>
													</table>
												</td>
												<td class="column column-2" width="33.333333333333336%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; background-color: #f2f2f2; border-right: 25px solid #1d294e; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-bottom: 0px; border-left: 0px;">
													<table class="paragraph_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
														<tr>
															<td class="pad" style="padding-bottom:10px;padding-right:30px;padding-top:10px;">
																<div style="color:#555555;font-family:Montserrat, Trebuchet MS, Lucida Grande, Lucida Sans Unicode, Lucida Sans, Tahoma, sans-serif;font-size:16px;line-height:120%;text-align:right;mso-line-height-alt:19.2px;">
																	<p style="margin: 0; word-break: break-word;"><strong><span>$ ${parseFloat(
                                    element.total,
                                  ).toFixed(2)}</span></strong></p>
																</div>
															</td>
														</tr>
													</table>
												</td>
											</tr>
										</tbody>
									</table>
								</td>
							</tr>
						</tbody>
					</table>
					<table class="row row-13" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
						<tbody>
							<tr>
								<td>
									<table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f2f2f2; color: #000000; width: 640px; margin: 0 auto;" width="640">
										<tbody>
											<tr>
												<td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; border-left: 25px solid #1d294e; border-right: 25px solid #1d294e; vertical-align: top; border-top: 0px; border-bottom: 0px;">
													<div class="spacer_block block-1" style="height:30px;line-height:30px;font-size:1px;">&#8202;</div>
												</td>
											</tr>
										</tbody>
									</table>
								</td>
							</tr>
						</tbody>
					</table>
					<table class="row row-14" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
						<tbody>
							<tr>
								<td>
									<table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #1d294e; color: #000000; width: 640px; margin: 0 auto;" width="640">
										<tbody>
											<tr>
												<td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; border-left: 25px solid transparent; border-right: 24px solid transparent; vertical-align: top; border-top: 0px; border-bottom: 0px;">
													<table class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
														<tr>
															<td class="pad" style="width:100%;padding-right:0px;padding-left:0px;">
																<div class="alignment" align="center" style="line-height:10px">
																	<div class="fullWidth" style="max-width: 591px;"><img src="https://d1oco4z2z1fhwp.cloudfront.net/templates/default/2571/receipt-bottom.png" style="display: block; height: auto; border: 0; width: 100%;" width="591" alt="Alternate text" title="Alternate text" height="auto"></div>
																</div>
															</td>
														</tr>
													</table>
													<div class="spacer_block block-2" style="height:30px;line-height:30px;font-size:1px;">&#8202;</div>
												</td>
											</tr>
										</tbody>
									</table>
								</td>
							</tr>
						</tbody>
					</table>
				</td>
			</tr>
		</tbody>
	</table><!-- End -->
</body>

</html>
`;

  return emailData;
};

const WelcomeEmailHtml = (name) => {
  return `
        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" style="line-height: inherit;">
      <head style="line-height: inherit;">
        <!--[if gte mso 9]>
		<xml>
			<o:OfficeDocumentSettings>
				<o:AllowPNG />
				<o:PixelsPerInch>96</o:PixelsPerInch>
			</o:OfficeDocumentSettings>
		</xml>
		<![endif]-->
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" style="line-height: inherit;">
        <meta name="viewport" content="width=device-width, initial-scale=1.0" style="line-height: inherit;">
        <meta name="x-apple-disable-message-reformatting" style="line-height: inherit;">
        <!--[if !mso]>
					<!-->
        <meta http-equiv="X-UA-Compatible" content="IE=edge" style="line-height: inherit;">
        <!--

						<![endif]-->
        <title style="line-height: inherit;"></title>
        <!--[if !mso]>
						<!-->
        <!--

						<![endif]-->
      </head>
      <body class="clean-body u_body" style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #f9f9f9;color: #000000;line-height: inherit;">
        <!--[if IE]>
						<div class="ie-container">
							<![endif]-->
        <!--[if mso]>
							<div class="mso-container">
								<![endif]-->
        <table id="u_body" style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;margin: 0 auto;background-color: #f9f9f9;width: 100%;line-height: inherit;color: #000000;" cellpadding="0" cellspacing="0">
          <tbody style="line-height: inherit;">
            <tr style="vertical-align: top;line-height: inherit;border-collapse: collapse;">
              <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;line-height: inherit;color: #000000;">
                <!--[if (mso)|(IE)]>
												<table width="100%" cellpadding="0" cellspacing="0" border="0">
													<tr>
														<td align="center" style="background-color: #f9f9f9;">
															<![endif]-->
                <div class="u-row-container" style="padding: 0px;background-color: #f9f9f9;line-height: inherit;">
                  <div class="u-row" style="margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #f9f9f9;line-height: inherit;width: 100% !important;">
                    <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;line-height: inherit;">
                      <!--[if (mso)|(IE)]>
																		<table width="100%" cellpadding="0" cellspacing="0" border="0">
																			<tr>
																				<td style="padding: 0px;background-color: #f9f9f9;" align="center">
																					<table cellpadding="0" cellspacing="0" border="0" style="width:600px;">
																						<tr style="background-color: #f9f9f9;">
																							<![endif]-->
                      <!--[if (mso)|(IE)]>
																							<td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top">
																								<![endif]-->
                      <div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;line-height: inherit;width: 600px !important;">
                        <div style="height: 100%;width: 100% !important;line-height: inherit;margin: 0 auto;">
                          <!--[if (!mso)&(!IE)]>
																										<!-->
                          <div style="box-sizing: border-box;height: 100%;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;line-height: inherit;">
                            <!--

																											<![endif]-->
                            <table style="font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                              <tbody style="line-height: inherit;">
                                <tr style="line-height: inherit;vertical-align: top;border-collapse: collapse;">
                                  <td style="overflow-wrap: break-word;word-break: break-word;padding: 15px;font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" align="left">
                                    <table height="0px" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;border-top: 1px solid #f9f9f9;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;line-height: inherit;color: #000000;">
                                      <tbody style="line-height: inherit;">
                                        <tr style="vertical-align: top;line-height: inherit;border-collapse: collapse;">
                                          <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;font-size: 0px;line-height: 0px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;color: #000000;">
                                            <span style="line-height: inherit;">&#160;</span>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            <!--[if (!mso)&(!IE)]>
																											<!-->
                          </div>
                          <!--

																										<![endif]-->
                        </div>
                      </div>
                      <!--[if (mso)|(IE)]>
																							</td>
																							<![endif]-->
                      <!--[if (mso)|(IE)]>
																						</tr>
																					</table>
																				</td>
																			</tr>
																		</table>
																		<![endif]-->
                    </div>
                  </div>
                </div>
                <div class="u-row-container" style="padding: 0px;background-color: transparent;line-height: inherit;">
                  <div class="u-row" style="margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #ffffff;line-height: inherit;width: 100% !important;">
                    <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;line-height: inherit;">
                      <!--[if (mso)|(IE)]>
																		<table width="100%" cellpadding="0" cellspacing="0" border="0">
																			<tr>
																				<td style="padding: 0px;background-color: transparent;" align="center">
																					<table cellpadding="0" cellspacing="0" border="0" style="width:600px;">
																						<tr style="background-color: #ffffff;">
																							<![endif]-->
                      <!--[if (mso)|(IE)]>
																							<td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top">
																								<![endif]-->
                      <div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;line-height: inherit;width: 600px !important;">
                        <div style="height: 100%;width: 100% !important;line-height: inherit;margin: 0 auto;">
                          <!--[if (!mso)&(!IE)]>
																										<!-->
                          <div style="box-sizing: border-box;height: 100%;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;line-height: inherit;">
                            <!--

																											<![endif]-->
                            <table style="font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                              <tbody style="line-height: inherit;">
                                <tr style="line-height: inherit;vertical-align: top;border-collapse: collapse;">
                                  <td style="overflow-wrap: break-word;word-break: break-word;padding: 25px 10px;font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" align="left">
                                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;">
                                      <tr style="line-height: inherit;vertical-align: top;border-collapse: collapse;">
                                        <td style="padding-right: 0px;padding-left: 0px;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" align="center">
                                          <img src="https://drive.usercontent.google.com/download?id=1r7_iRR9PuWgLGl4RyQXg9t_FLrYnlfcm" alt="DPOS Logo" title="DPOS Logo" style="outline: none;text-decoration: none;display: inline-block;height: auto;width: 168px;/* fixed width for consistency */
    max-width: 100%;/* ensures responsiveness */: ;line-height: inherit;" width="168">
                                        </td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            <!--[if (!mso)&(!IE)]>
																												<!-->
                          </div>
                          <!--

																											<![endif]-->
                        </div>
                      </div>
                      <!--[if (mso)|(IE)]>
																								</td>
																								<![endif]-->
                      <!--[if (mso)|(IE)]>
																							</tr>
																						</table>
																					</td>
																				</tr>
																			</table>
																			<![endif]-->
                    </div>
                  </div>
                </div>
                <div class="u-row-container" style="padding: 0px;background-color: transparent;line-height: inherit;">
                  <div class="u-row" style="margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #161a39;line-height: inherit;width: 100% !important;">
                    <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;line-height: inherit;">
                      <!--[if (mso)|(IE)]>
																			<table width="100%" cellpadding="0" cellspacing="0" border="0">
																				<tr>
																					<td style="padding: 0px;background-color: transparent;" align="center">
																						<table cellpadding="0" cellspacing="0" border="0" style="width:600px;">
																							<tr style="background-color: #161a39;">
																								<![endif]-->
                      <!--[if (mso)|(IE)]>
																								<td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top">
																									<![endif]-->
                      <div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;line-height: inherit;width: 600px !important;">
                        <div style="height: 100%;width: 100% !important;line-height: inherit;margin: 0 auto;">
                          <!--[if (!mso)&(!IE)]>
																											<!-->
                          <div style="box-sizing: border-box;height: 100%;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;line-height: inherit;">
                            <!--

																												<![endif]-->
                            <table style="font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                              <tbody style="line-height: inherit;">
                                <tr style="line-height: inherit;vertical-align: top;border-collapse: collapse;">
                                  <td style="overflow-wrap: break-word;word-break: break-word;padding: 35px 10px 10px;font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" align="left">
                                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;">
                                      <tr style="line-height: inherit;vertical-align: top;border-collapse: collapse;">
                                        <td style="padding-right: 0px;padding-left: 0px;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" align="center"></td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            <table style="font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                              <tbody style="line-height: inherit;">
                                <tr style="line-height: inherit;vertical-align: top;border-collapse: collapse;">
                                  <td style="overflow-wrap: break-word;word-break: break-word;padding: 0px 10px 30px;font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" align="left">
                                    <div style="
                                    font-size: 14px;
                                    line-height: 140%;
                                    text-align: left;
                                    word-wrap: break-word;
                                  ">
                                      <p style="font-size: 14px;line-height: 140%;text-align: center;margin: 0;">
                                        <span style="
                                        font-size: 28px;
                                        line-height: 39.2px;
                                        color: #ffffff;
                                        font-family: Lato, sans-serif;
                                      ">${name}, Welcome To Divine POS!</span>
                                      </p>
                                    </div>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            <!--[if (!mso)&(!IE)]>
																												<!-->
                          </div>
                          <!--

																											<![endif]-->
                        </div>
                      </div>
                      <!--[if (mso)|(IE)]>
																								</td>
																								<![endif]-->
                      <!--[if (mso)|(IE)]>
																							</tr>
																						</table>
																					</td>
																				</tr>
																			</table>
																			<![endif]-->
                    </div>
                  </div>
                </div>
                <div class="u-row-container" style="padding: 0px;background-color: transparent;line-height: inherit;">
                  <div class="u-row" style="margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #ffffff;line-height: inherit;width: 100% !important;">
                    <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;line-height: inherit;">
                      <!--[if (mso)|(IE)]>
																			<table width="100%" cellpadding="0" cellspacing="0" border="0">
																				<tr>
																					<td style="padding: 0px;background-color: transparent;" align="center">
																						<table cellpadding="0" cellspacing="0" border="0" style="width:600px;">
																							<tr style="background-color: #ffffff;">
																								<![endif]-->
                      <!--[if (mso)|(IE)]>
																								<td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top">
																									<![endif]-->
                      <div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;line-height: inherit;width: 600px !important;">
                        <div style="height: 100%;width: 100% !important;line-height: inherit;margin: 0 auto;">
                          <!--[if (!mso)&(!IE)]>
																											<!-->
                          <div style="box-sizing: border-box;height: 100%;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;line-height: inherit;">
                            <!--

																												<![endif]-->
                            <table style="font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                              <tbody style="line-height: inherit;">
                                <tr style="line-height: inherit;vertical-align: top;border-collapse: collapse;">
                                  <td style="overflow-wrap: break-word;word-break: break-word;padding: 40px 40px 30px;font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" align="left">
                                    <div style="
                                    font-size: 14px;
                                    line-height: 140%;
                                    text-align: left;
                                    word-wrap: break-word;
                                  ">
                                      <p style="font-family: Arial, Helvetica, sans-serif; color: rgb(0, 0, 0); background-color: rgb(255, 255, 255); isolation: isolate;">
    <p><span style="color:#0d0d0d;font-size:12pt;">&nbsp;We&apos;re thrilled to have you join us on a journey to streamline and enhance your business operations with our point-of-sale software. You&rsquo;ve taken the first step towards transforming how your business handles transactions, manages data, and serves your valued customers.</span></p>
    <p><strong><span style="color:#0d0d0d;font-size:12pt;">Your Free Trial Activation</span></strong></p>
    <p><span style="color:#0d0d0d;font-size:12pt;">Your free trial is now active and ready for you to explore all the powerful features of Divine POS. Get started by accessing your dashboard</span><a href="https://auth.divinepos.com/pos"><span style="color:#1155cc;font-size:12pt;">&nbsp;</span><u><span style="color:#1155cc;font-size:12pt;">here</span></u></a><span style="color:#0d0d0d;font-size:12pt;">. To help you hit the ground running, here are a few resources you might find helpful:</span></p>
    <ul>
        <li style="list-style-type:disc;color:#0d0d0d;font-size:12pt;">
            <p><span style="color:#0d0d0d;font-size:12pt;">Quick Start Guide: Learn how to set up your POS system with our easy step-by-step guide</span><a href="https://auth.divinepos.com/authed/help"><span style="color:#1155cc;font-size:12pt;">&nbsp;</span><u><span style="color:#1155cc;font-size:12pt;">here</span></u></a><span style="color:#0d0d0d;font-size:12pt;">.</span></p>
        </li>
        <li style="list-style-type:disc;color:#0d0d0d;font-size:12pt;">
            <p><span style="color:#0d0d0d;font-size:12pt;">Video Tutorials: Watch our tutorial videos for tips on making the most of your POS</span><a href="https://auth.divinepos.com/authed/help"><span style="color:#1155cc;font-size:12pt;">&nbsp;</span><u><span style="color:#1155cc;font-size:12pt;">here</span></u></a><span style="color:#0d0d0d;font-size:12pt;">.</span></p>
        </li>
        <li style="list-style-type:disc;color:#0d0d0d;font-size:12pt;">
            <p><span style="color:#0d0d0d;font-size:12pt;">FAQ: Have questions? Find answers to frequently asked questions</span><a href="https://divinepos.com/faq/"><span style="color:#1155cc;font-size:12pt;">&nbsp;</span><u><span style="color:#1155cc;font-size:12pt;">here</span></u></a><span style="color:#0d0d0d;font-size:12pt;">.</span></p>
        </li>
    </ul>
    <p><strong><span style="color:#0d0d0d;font-size:12pt;">Get the Most Out of Your Trial</span></strong></p>
    <p><span style="color:#0d0d0d;font-size:12pt;">During your trial period, you have full access to all the features of our POS system. We encourage you to test every function and see how it fits into your daily operations. Here&rsquo;s what you can do:</span></p>
    <ul>
        <li style="list-style-type:disc;color:#0d0d0d;font-size:12pt;">
            <p><span style="color:#0d0d0d;font-size:12pt;">Customize Your Setup: Tailor your POS settings to perfectly fit your business model.</span></p>
        </li>
        <li style="list-style-type:disc;color:#0d0d0d;font-size:12pt;">
            <p><span style="color:#0d0d0d;font-size:12pt;">Process Transactions: Experience how easy and fast it is to process transactions.</span></p>
        </li>
        <li style="list-style-type:disc;color:#0d0d0d;font-size:12pt;">
            <p><span style="color:#0d0d0d;background-color:#ffffff;font-size:12pt;">Universal Integration Compatibility: Seamlessly integrate our POS system with your existing setups and devices.</span></p>
        </li>
    </ul>
    <p><strong><span style="color:#0d0d0d;font-size:12pt;">We&rsquo;re Here to Help</span></strong></p>
    <p><span style="color:#0d0d0d;font-size:12pt;">If you have any questions or need assistance at any point, our dedicated support team is here to help. You can reach us by:</span></p>
    <ul>
        <li style="list-style-type:disc;color:#0d0d0d;font-size:12pt;">
            <p><span style="color:#0d0d0d;font-size:12pt;">Email: support@divinepos.com</span></p>
        </li>
        <li style="list-style-type:disc;color:#0d0d0d;font-size:12pt;">
            <p><span style="color:#0d0d0d;font-size:12pt;">Phone: 1 (833) 348 7671</span></p>
        </li>
    </ul>
    <p><span style="color:#0d0d0d;font-size:12pt;">Thank you for choosing Divine POS. We&apos;re excited to be part of your business growth and success. Make the most of your free trial and discover all the ways Divine POS can benefit your business.</span></p>
    <p><span style="color:#0d0d0d;font-size:12pt;">Best regards,</span></p>
    <p><span style="color:#0d0d0d;font-size:12pt;">The Divine POS Team</span></p>
</p>
                                    </div>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            <table style="font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                              <tbody style="line-height: inherit;">
                                <tr style="line-height: inherit;vertical-align: top;border-collapse: collapse;">
                                  <td style="overflow-wrap: break-word;word-break: break-word;padding: 0px 40px;font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" align="left">
                                    <!--[if mso
                                  ]>
																																<style>
                                    .v-button {
                                      background: transparent !important;
                                    }
                                  </style>
																																<!
                                [endif]-->
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            <!--[if (!mso)&(!IE)]>
																												<!-->
                          </div>
                          <!--

																											<![endif]-->
                        </div>
                      </div>
                      <!--[if (mso)|(IE)]>
																								</td>
																								<![endif]-->
                      <!--[if (mso)|(IE)]>
																							</tr>
																						</table>
																					</td>
																				</tr>
																			</table>
																			<![endif]-->
                    </div>
                  </div>
                </div>
                <div class="u-row-container" style="padding: 0px;background-color: transparent;line-height: inherit;">
                  <div class="u-row" style="margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #18163a;line-height: inherit;width: 100% !important;">
                    <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;line-height: inherit;">
                      <!--[if (mso)|(IE)]>
																			<table width="100%" cellpadding="0" cellspacing="0" border="0">
																				<tr>
																					<td style="padding: 0px;background-color: transparent;" align="center">
																						<table cellpadding="0" cellspacing="0" border="0" style="width:600px;">
																							<tr style="background-color: #18163a;">
																								<![endif]-->
                      <!--[if (mso)|(IE)]>
																								<td align="center" width="300" style="width: 300px;padding: 20px 20px 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top">
																									<![endif]-->
                      <div class="u-col u-col-50" style="max-width: 320px;min-width: 300px;display: table-cell;vertical-align: top;line-height: inherit;width: 300px !important;">
                        <div style="height: 100%;width: 100% !important;line-height: inherit;margin: 0 auto;">
                          <!--[if (!mso)&(!IE)]>
																											<!-->
                          <div style="box-sizing: border-box;height: 100%;padding: 20px 20px 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;line-height: inherit;">
                            <!--

																												<![endif]-->
                            <table style="font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                              <tbody style="line-height: inherit;">
                                <tr style="line-height: inherit;vertical-align: top;border-collapse: collapse;">
                                  <td style="overflow-wrap: break-word;word-break: break-word;padding: 10px;font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" align="left">
                                    <div style="
                                    font-size: 14px;
                                    line-height: 140%;
                                    text-align: left;
                                    word-wrap: break-word;
                                  ">
                                      <p style="font-size: 14px;line-height: 140%;margin: 0;">
                                        <span style="
                                        font-size: 16px;
                                        line-height: 22.4px;
                                        color: #ecf0f1;
                                      ">Contact </span>
                                      </p>
                                      <p style="font-size: 14px;line-height: 140%;margin: 0;">
                                        <span style="
                                        font-size: 14px;
                                        line-height: 19.6px;
                                        color: #ecf0f1;
                                      ">1 (833) 348-7671 </span>
                                      </p>
                                      <p style="font-size: 14px;line-height: 140%;margin: 0;">
                                        <span style="font-size: 14px; line-height: 19.6px; color: #ecf0f1;">
                                          <a href="mailto:support@divinepos.com" style="color: #ecf0f1;text-decoration: none;line-height: inherit;">support@divinepos.com</a>
                                        </span>
                                      </p>
                                    </div>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            <!--[if (!mso)&(!IE)]>
																												<!-->
                          </div>
                          <!--

																											<![endif]-->
                        </div>
                      </div>
                      <!--[if (mso)|(IE)]>
																								</td>
																								<![endif]-->
                      <!--[if (mso)|(IE)]>
																								<td align="center" width="300" style="width: 300px;padding: 0px 0px 0px 20px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top">
																									<![endif]-->
                      <div class="u-col u-col-50" style="max-width: 320px;min-width: 300px;display: table-cell;vertical-align: top;line-height: inherit;width: 300px !important;">
                        <div style="height: 100%;width: 100% !important;line-height: inherit;margin: 0 auto;">
                          <!--[if (!mso)&(!IE)]>
																											<!-->
                          <div style="box-sizing: border-box;height: 100%;padding: 0px 0px 0px 20px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;line-height: inherit;">
                            <!--

																												<![endif]-->
                            <table style="font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                              <tbody style="line-height: inherit;">
                                <tr style="line-height: inherit;vertical-align: top;border-collapse: collapse;">
                                  <td style="overflow-wrap: break-word;word-break: break-word;padding: 25px 10px 10px;font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" align="left">
                                    <div align="left" style="line-height: inherit;">
                                      <div style="display: table;max-width: 140px;line-height: inherit;">
                                        <!--[if (mso)|(IE)]>
																																		<table width="140" cellpadding="0" cellspacing="0" border="0">
																																			<tr>
																																				<td style="border-collapse:collapse;" align="left">
																																					<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse; mso-table-lspace: 0pt;mso-table-rspace: 0pt; width:140px;">
																																						<tr>
																																							<![endif]-->
                                        <!--[if (mso)|(IE)]>
																																							<td width="32" style="width:32px; padding-right: 15px;" valign="top">
																																								<![endif]-->
                                        <table align="left" border="0" cellspacing="0" cellpadding="0" width="32" height="32" style="width: 32px !important;height: 32px !important;display: inline-block;border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;margin-right: 15px;line-height: inherit;color: #000000;">
                                          <tbody style="line-height: inherit;">
                                            <tr style="vertical-align: top;line-height: inherit;border-collapse: collapse;">
                                              <td align="left" valign="middle" style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;line-height: inherit;color: #000000;">
                                                <a href=" https://www.facebook.com/divinepos" title="Facebook" target="_blank" style="line-height: inherit;color: #161a39;text-decoration: underline;">
                                                  <img src="https://drive.usercontent.google.com/download?id=1ztDO1YYb7VGlXXnVvFmuXhC5-fUmYy2U" alt="Facebook" title="Facebook" width="32" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: block !important;border: none;height: auto;float: none;max-width: 32px !important;line-height: inherit;">
                                                </a>
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                        <!--[if (mso)|(IE)]>
																																								</td>
																																								<![endif]-->
                                        <!--[if (mso)|(IE)]>
																																								<td width="32" style="width:32px; padding-right: 15px;" valign="top">
																																									<![endif]-->
                                        <table align="left" border="0" cellspacing="0" cellpadding="0" width="32" height="32" style="width: 32px !important;height: 32px !important;display: inline-block;border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;margin-right: 15px;line-height: inherit;color: #000000;">
                                          <tbody style="line-height: inherit;">
                                            <tr style="vertical-align: top;line-height: inherit;border-collapse: collapse;">
                                              <td align="left" valign="middle" style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;line-height: inherit;color: #000000;">
                                                <a href=" https://twitter.com/divine_pos" title="Twitter" target="_blank" style="line-height: inherit;color: #161a39;text-decoration: underline;">
                                                  <img src="https://drive.usercontent.google.com/download?id=1xKZwgFBoZlRX-G1p11NP9IMuTfVahMbz" alt="Twitter" title="Twitter" width="32" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: block !important;border: none;height: auto;float: none;max-width: 32px !important;line-height: inherit;">
                                                </a>
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                        <!--[if (mso)|(IE)]>
																																									</td>
																																									<![endif]-->
                                        <!--[if (mso)|(IE)]>
																																									<td width="32" style="width:32px; padding-right: 0px;" valign="top">
																																										<![endif]-->
                                        <table align="left" border="0" cellspacing="0" cellpadding="0" width="32" height="32" style="width: 32px !important;height: 32px !important;display: inline-block;border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;margin-right: 0px;line-height: inherit;color: #000000;">
                                          <tbody style="line-height: inherit;">
                                            <tr style="vertical-align: top;line-height: inherit;border-collapse: collapse;">
                                              <td align="left" valign="middle" style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;line-height: inherit;color: #000000;">
                                                <a href=" https://www.linkedin.com/company/divinepos" title="LinkedIn" target="_blank" style="line-height: inherit;color: #161a39;text-decoration: underline;">
                                                  <img src="https://drive.usercontent.google.com/download?id=158hro6-R56oDvPeo1ib9EADt5mJt5J4L" alt="LinkedIn" title="LinkedIn" width="32" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: block !important;border: none;height: auto;float: none;max-width: 32px !important;line-height: inherit;">
                                                </a>
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                        <!--[if (mso)|(IE)]>
																																										</td>
																																										<![endif]-->
                                        <!--[if (mso)|(IE)]>
																																									</tr>
																																								</table>
																																							</td>
																																						</tr>
																																					</table>
																																					<![endif]-->
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            <table style="font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                              <tbody style="line-height: inherit;">
                                <tr style="line-height: inherit;vertical-align: top;border-collapse: collapse;">
                                  <td style="overflow-wrap: break-word;word-break: break-word;padding: 5px 10px 10px;font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" align="left">
                                    <div style="
                                    font-size: 14px;
                                    line-height: 140%;
                                    text-align: left;
                                    word-wrap: break-word;
                                  ">
                                      <p style="line-height: 140%;font-size: 14px;margin: 0;">
                                        <span style="
                                        font-size: 14px;
                                        line-height: 19.6px;
                                      ">
                                          <span style="
                                          color: #ecf0f1;
                                          font-size: 14px;
                                          line-height: 19.6px;
                                        ">
                                            <span style="
                                            line-height: 19.6px;
                                            font-size: 14px;
                                          ">Divine POS © All Rights Reserved </span>
                                          </span>
                                        </span>
                                      </p>
                                    </div>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            <!--[if (!mso)&(!IE)]>
																															<!-->
                          </div>
                          <!--

																														<![endif]-->
                        </div>
                      </div>
                      <!--[if (mso)|(IE)]>
																											</td>
																											<![endif]-->
                      <!--[if (mso)|(IE)]>
																										</tr>
																									</table>
																								</td>
																							</tr>
																						</table>
																						<![endif]-->
                    </div>
                  </div>
                </div>
                <div class="u-row-container" style="padding: 0px;background-color: #f9f9f9;line-height: inherit;">
                  <div class="u-row" style="margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #1c103b;line-height: inherit;width: 100% !important;">
                    <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;line-height: inherit;">
                      <!--[if (mso)|(IE)]>
																						<table width="100%" cellpadding="0" cellspacing="0" border="0">
																							<tr>
																								<td style="padding: 0px;background-color: #f9f9f9;" align="center">
																									<table cellpadding="0" cellspacing="0" border="0" style="width:600px;">
																										<tr style="background-color: #1c103b;">
																											<![endif]-->
                      <!--[if (mso)|(IE)]>
																											<td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top">
																												<![endif]-->
                      <div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;line-height: inherit;width: 600px !important;">
                        <div style="height: 100%;width: 100% !important;line-height: inherit;margin: 0 auto;">
                          <!--[if (!mso)&(!IE)]>
																														<!-->
                          <div style="box-sizing: border-box;height: 100%;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;line-height: inherit;">
                            <!--

																															<![endif]-->
                            <table style="font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                              <tbody style="line-height: inherit;">
                                <tr style="line-height: inherit;vertical-align: top;border-collapse: collapse;">
                                  <td style="overflow-wrap: break-word;word-break: break-word;padding: 15px;font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" align="left">
                                    <table height="0px" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;border-top: 1px solid #1c103b;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;line-height: inherit;color: #000000;">
                                      <tbody style="line-height: inherit;">
                                        <tr style="vertical-align: top;line-height: inherit;border-collapse: collapse;">
                                          <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;font-size: 0px;line-height: 0px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;color: #000000;">
                                            <span style="line-height: inherit;">&#160;</span>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            <!--[if (!mso)&(!IE)]>
																															<!-->
                          </div>
                          <!--

																														<![endif]-->
                        </div>
                      </div>
                      <!--[if (mso)|(IE)]>
																											</td>
																											<![endif]-->
                      <!--[if (mso)|(IE)]>
																										</tr>
																									</table>
																								</td>
																							</tr>
																						</table>
																						<![endif]-->
                    </div>
                  </div>
                </div>
                <div class="u-row-container" style="padding: 0px;background-color: transparent;line-height: inherit;">
                  <div class="u-row" style="margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #f9f9f9;line-height: inherit;width: 100% !important;">
                    <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;line-height: inherit;">
                      <!--[if (mso)|(IE)]>
																						<table width="100%" cellpadding="0" cellspacing="0" border="0">
																							<tr>
																								<td style="padding: 0px;background-color: transparent;" align="center">
																									<table cellpadding="0" cellspacing="0" border="0" style="width:600px;">
																										<tr style="background-color: #f9f9f9;">
																											<![endif]-->
                      <!--[if (mso)|(IE)]>
																											<td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top">
																												<![endif]-->
                      <div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;line-height: inherit;width: 600px !important;">
                        <div style="height: 100%;width: 100% !important;line-height: inherit;margin: 0 auto;">
                          <!--[if (!mso)&(!IE)]>
																														<!-->
                          <div style="box-sizing: border-box;height: 100%;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;line-height: inherit;">
                            <!--

																															<![endif]-->
                            <table style="font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                              <tbody style="line-height: inherit;">
                                <tr style="line-height: inherit;vertical-align: top;border-collapse: collapse;">
                                  <td style="overflow-wrap: break-word;word-break: break-word;padding: 0px 40px 30px 20px;font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" align="left">
                                    <div style="
                                    font-size: 14px;
                                    line-height: 140%;
                                    text-align: left;
                                    word-wrap: break-word;
                                  "></div>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            <!--[if (!mso)&(!IE)]>
																															<!-->
                          </div>
                          <!--

																														<![endif]-->
                        </div>
                      </div>
                      <!--[if (mso)|(IE)]>
																											</td>
																											<![endif]-->
                      <!--[if (mso)|(IE)]>
																										</tr>
																									</table>
																								</td>
																							</tr>
																						</table>
																						<![endif]-->
                    </div>
                  </div>
                </div>
                <!--[if (mso)|(IE)]>
																		</td>
																	</tr>
																</table>
																<![endif]-->
              </td>
            </tr>
          </tbody>
        </table>
        <!--[if mso]>
											</div>
											<![endif]-->
        <!--[if IE]>
										</div>
										<![endif]-->
      </body>
    </html>
    `;
};

const WelcomeEmailHtmlPaid = (name) => {
  return `
     <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" style="line-height: inherit;">
      <head style="line-height: inherit;">
        <!--[if gte mso 9]>
		<xml>
			<o:OfficeDocumentSettings>
				<o:AllowPNG />
				<o:PixelsPerInch>96</o:PixelsPerInch>
			</o:OfficeDocumentSettings>
		</xml>
		<![endif]-->
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" style="line-height: inherit;">
        <meta name="viewport" content="width=device-width, initial-scale=1.0" style="line-height: inherit;">
        <meta name="x-apple-disable-message-reformatting" style="line-height: inherit;">
        <!--[if !mso]>
					<!-->
        <meta http-equiv="X-UA-Compatible" content="IE=edge" style="line-height: inherit;">
        <!--

						<![endif]-->
        <title style="line-height: inherit;"></title>
        <!--[if !mso]>
						<!-->
        <!--

						<![endif]-->
      </head>
      <body class="clean-body u_body" style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #f9f9f9;color: #000000;line-height: inherit;">
        <!--[if IE]>
						<div class="ie-container">
							<![endif]-->
        <!--[if mso]>
							<div class="mso-container">
								<![endif]-->
        <table id="u_body" style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;margin: 0 auto;background-color: #f9f9f9;width: 100%;line-height: inherit;color: #000000;" cellpadding="0" cellspacing="0">
          <tbody style="line-height: inherit;">
            <tr style="vertical-align: top;line-height: inherit;border-collapse: collapse;">
              <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;line-height: inherit;color: #000000;">
                <!--[if (mso)|(IE)]>
												<table width="100%" cellpadding="0" cellspacing="0" border="0">
													<tr>
														<td align="center" style="background-color: #f9f9f9;">
															<![endif]-->
                <div class="u-row-container" style="padding: 0px;background-color: #f9f9f9;line-height: inherit;">
                  <div class="u-row" style="margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #f9f9f9;line-height: inherit;width: 100% !important;">
                    <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;line-height: inherit;">
                      <!--[if (mso)|(IE)]>
																		<table width="100%" cellpadding="0" cellspacing="0" border="0">
																			<tr>
																				<td style="padding: 0px;background-color: #f9f9f9;" align="center">
																					<table cellpadding="0" cellspacing="0" border="0" style="width:600px;">
																						<tr style="background-color: #f9f9f9;">
																							<![endif]-->
                      <!--[if (mso)|(IE)]>
																							<td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top">
																								<![endif]-->
                      <div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;line-height: inherit;width: 600px !important;">
                        <div style="height: 100%;width: 100% !important;line-height: inherit;margin: 0 auto;">
                          <!--[if (!mso)&(!IE)]>
																										<!-->
                          <div style="box-sizing: border-box;height: 100%;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;line-height: inherit;">
                            <!--

																											<![endif]-->
                            <table style="font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                              <tbody style="line-height: inherit;">
                                <tr style="line-height: inherit;vertical-align: top;border-collapse: collapse;">
                                  <td style="overflow-wrap: break-word;word-break: break-word;padding: 15px;font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" align="left">
                                    <table height="0px" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;border-top: 1px solid #f9f9f9;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;line-height: inherit;color: #000000;">
                                      <tbody style="line-height: inherit;">
                                        <tr style="vertical-align: top;line-height: inherit;border-collapse: collapse;">
                                          <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;font-size: 0px;line-height: 0px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;color: #000000;">
                                            <span style="line-height: inherit;">&#160;</span>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            <!--[if (!mso)&(!IE)]>
																											<!-->
                          </div>
                          <!--

																										<![endif]-->
                        </div>
                      </div>
                      <!--[if (mso)|(IE)]>
																							</td>
																							<![endif]-->
                      <!--[if (mso)|(IE)]>
																						</tr>
																					</table>
																				</td>
																			</tr>
																		</table>
																		<![endif]-->
                    </div>
                  </div>
                </div>
                <div class="u-row-container" style="padding: 0px;background-color: transparent;line-height: inherit;">
                  <div class="u-row" style="margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #ffffff;line-height: inherit;width: 100% !important;">
                    <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;line-height: inherit;">
                      <!--[if (mso)|(IE)]>
																		<table width="100%" cellpadding="0" cellspacing="0" border="0">
																			<tr>
																				<td style="padding: 0px;background-color: transparent;" align="center">
																					<table cellpadding="0" cellspacing="0" border="0" style="width:600px;">
																						<tr style="background-color: #ffffff;">
																							<![endif]-->
                      <!--[if (mso)|(IE)]>
																							<td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top">
																								<![endif]-->
                      <div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;line-height: inherit;width: 600px !important;">
                        <div style="height: 100%;width: 100% !important;line-height: inherit;margin: 0 auto;">
                          <!--[if (!mso)&(!IE)]>
																										<!-->
                          <div style="box-sizing: border-box;height: 100%;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;line-height: inherit;">
                            <!--

																											<![endif]-->
                            <table style="font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                              <tbody style="line-height: inherit;">
                                <tr style="line-height: inherit;vertical-align: top;border-collapse: collapse;">
                                  <td style="overflow-wrap: break-word;word-break: break-word;padding: 25px 10px;font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" align="left">
                                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;">
                                      <tr style="line-height: inherit;vertical-align: top;border-collapse: collapse;">
                                        <td style="padding-right: 0px;padding-left: 0px;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" align="center">
                                          <img src="https://drive.usercontent.google.com/download?id=1r7_iRR9PuWgLGl4RyQXg9t_FLrYnlfcm" alt="DPOS Logo" title="DPOS Logo" style="outline: none;text-decoration: none;display: inline-block;height: auto;width: 168px;/* fixed width for consistency */
    max-width: 100%;/* ensures responsiveness */: ;line-height: inherit;" width="168">
                                        </td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            <!--[if (!mso)&(!IE)]>
																												<!-->
                          </div>
                          <!--

																											<![endif]-->
                        </div>
                      </div>
                      <!--[if (mso)|(IE)]>
																								</td>
																								<![endif]-->
                      <!--[if (mso)|(IE)]>
																							</tr>
																						</table>
																					</td>
																				</tr>
																			</table>
																			<![endif]-->
                    </div>
                  </div>
                </div>
                <div class="u-row-container" style="padding: 0px;background-color: transparent;line-height: inherit;">
                  <div class="u-row" style="margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #161a39;line-height: inherit;width: 100% !important;">
                    <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;line-height: inherit;">
                      <!--[if (mso)|(IE)]>
																			<table width="100%" cellpadding="0" cellspacing="0" border="0">
																				<tr>
																					<td style="padding: 0px;background-color: transparent;" align="center">
																						<table cellpadding="0" cellspacing="0" border="0" style="width:600px;">
																							<tr style="background-color: #161a39;">
																								<![endif]-->
                      <!--[if (mso)|(IE)]>
																								<td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top">
																									<![endif]-->
                      <div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;line-height: inherit;width: 600px !important;">
                        <div style="height: 100%;width: 100% !important;line-height: inherit;margin: 0 auto;">
                          <!--[if (!mso)&(!IE)]>
																											<!-->
                          <div style="box-sizing: border-box;height: 100%;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;line-height: inherit;">
                            <!--

																												<![endif]-->
                            <table style="font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                              <tbody style="line-height: inherit;">
                                <tr style="line-height: inherit;vertical-align: top;border-collapse: collapse;">
                                  <td style="overflow-wrap: break-word;word-break: break-word;padding: 35px 10px 10px;font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" align="left">
                                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;">
                                      <tr style="line-height: inherit;vertical-align: top;border-collapse: collapse;">
                                        <td style="padding-right: 0px;padding-left: 0px;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" align="center"></td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            <table style="font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                              <tbody style="line-height: inherit;">
                                <tr style="line-height: inherit;vertical-align: top;border-collapse: collapse;">
                                  <td style="overflow-wrap: break-word;word-break: break-word;padding: 0px 10px 30px;font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" align="left">
                                    <div style="
                                    font-size: 14px;
                                    line-height: 140%;
                                    text-align: left;
                                    word-wrap: break-word;
                                  ">
                                      <p style="font-size: 14px;line-height: 140%;text-align: center;margin: 0;">
                                        <span style="
                                        font-size: 28px;
                                        line-height: 39.2px;
                                        color: #ffffff;
                                        font-family: Lato, sans-serif;
                                      ">${name}, Welcome To Divine POS!</span>
                                      </p>
                                    </div>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            <!--[if (!mso)&(!IE)]>
																												<!-->
                          </div>
                          <!--

																											<![endif]-->
                        </div>
                      </div>
                      <!--[if (mso)|(IE)]>
																								</td>
																								<![endif]-->
                      <!--[if (mso)|(IE)]>
																							</tr>
																						</table>
																					</td>
																				</tr>
																			</table>
																			<![endif]-->
                    </div>
                  </div>
                </div>
                <div class="u-row-container" style="padding: 0px;background-color: transparent;line-height: inherit;">
                  <div class="u-row" style="margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #ffffff;line-height: inherit;width: 100% !important;">
                    <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;line-height: inherit;">
                      <!--[if (mso)|(IE)]>
																			<table width="100%" cellpadding="0" cellspacing="0" border="0">
																				<tr>
																					<td style="padding: 0px;background-color: transparent;" align="center">
																						<table cellpadding="0" cellspacing="0" border="0" style="width:600px;">
																							<tr style="background-color: #ffffff;">
																								<![endif]-->
                      <!--[if (mso)|(IE)]>
																								<td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top">
																									<![endif]-->
                      <div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;line-height: inherit;width: 600px !important;">
                        <div style="height: 100%;width: 100% !important;line-height: inherit;margin: 0 auto;">
                          <!--[if (!mso)&(!IE)]>
																											<!-->
                          <div style="box-sizing: border-box;height: 100%;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;line-height: inherit;">
                            <!--

																												<![endif]-->
                            <table style="font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                              <tbody style="line-height: inherit;">
                                <tr style="line-height: inherit;vertical-align: top;border-collapse: collapse;">
                                  <td style="overflow-wrap: break-word;word-break: break-word;padding: 40px 40px 30px;font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" align="left">
                                    <div style="
                                    font-size: 14px;
                                    line-height: 140%;
                                    text-align: left;
                                    word-wrap: break-word;
                                  ">
                                      <p style="font-family: Arial, Helvetica, sans-serif; color: rgb(0, 0, 0); background-color: rgb(255, 255, 255); isolation: isolate;">
    <p><span style="color:#0d0d0d;font-size:12pt;">&nbsp;We&apos;re thrilled to have you join us on a journey to streamline and enhance your business operations with our point-of-sale software. You&rsquo;ve taken the first step towards transforming how your business handles transactions, manages data, and serves your valued customers.</span></p>
    <p><strong><span style="color:#0d0d0d;font-size:12pt;">Your Subscription Activation</span></strong></p>
    <p><span style="color:#0d0d0d;font-size:12pt;">Congratulations on activating your subscription! You now have full access to all the powerful features of Divine POS. Get started by accessing your dashboard here. To help you hit the ground running, here are a few resources you might find helpful:</span><a href="https://auth.divinepos.com/pos"><span style="color:#1155cc;font-size:12pt;">&nbsp;</span><u><span style="color:#1155cc;font-size:12pt;">here</span></u></a><span style="color:#0d0d0d;font-size:12pt;">. To help you hit the ground running, here are a few resources you might find helpful:</span></p>
    <ul>
        <li style="list-style-type:disc;color:#0d0d0d;font-size:12pt;">
            <p><span style="color:#0d0d0d;font-size:12pt;">Quick Start Guide: Learn how to set up your POS system with our easy step-by-step guide</span><a href="https://auth.divinepos.com/authed/help"><span style="color:#1155cc;font-size:12pt;">&nbsp;</span><u><span style="color:#1155cc;font-size:12pt;">here</span></u></a><span style="color:#0d0d0d;font-size:12pt;">.</span></p>
        </li>
        <li style="list-style-type:disc;color:#0d0d0d;font-size:12pt;">
            <p><span style="color:#0d0d0d;font-size:12pt;">Video Tutorials: Watch our tutorial videos for tips on making the most of your POS</span><a href="https://auth.divinepos.com/authed/help"><span style="color:#1155cc;font-size:12pt;">&nbsp;</span><u><span style="color:#1155cc;font-size:12pt;">here</span></u></a><span style="color:#0d0d0d;font-size:12pt;">.</span></p>
        </li>
        <li style="list-style-type:disc;color:#0d0d0d;font-size:12pt;">
            <p><span style="color:#0d0d0d;font-size:12pt;">FAQ: Have questions? Find answers to frequently asked questions</span><a href="https://divinepos.com/faq/"><span style="color:#1155cc;font-size:12pt;">&nbsp;</span><u><span style="color:#1155cc;font-size:12pt;">here</span></u></a><span style="color:#0d0d0d;font-size:12pt;">.</span></p>
        </li>
    </ul>
    <p><strong><span style="color:#0d0d0d;font-size:12pt;">Get the Most Out of Your Trial</span></strong></p>
    <p><span style="color:#0d0d0d;font-size:12pt;">During your trial period, you have full access to all the features of our POS system. We encourage you to test every function and see how it fits into your daily operations. Here&rsquo;s what you can do:</span></p>
    <ul>
        <li style="list-style-type:disc;color:#0d0d0d;font-size:12pt;">
            <p><span style="color:#0d0d0d;font-size:12pt;">Customize Your Setup: Tailor your POS settings to perfectly fit your business model.</span></p>
        </li>
        <li style="list-style-type:disc;color:#0d0d0d;font-size:12pt;">
            <p><span style="color:#0d0d0d;font-size:12pt;">Process Transactions: Experience how easy and fast it is to process transactions.</span></p>
        </li>
        <li style="list-style-type:disc;color:#0d0d0d;font-size:12pt;">
            <p><span style="color:#0d0d0d;background-color:#ffffff;font-size:12pt;">Universal Integration Compatibility: Seamlessly integrate our POS system with your existing setups and devices.</span></p>
        </li>
    </ul>
    <p><strong><span style="color:#0d0d0d;font-size:12pt;">We&rsquo;re Here to Help</span></strong></p>
    <p><span style="color:#0d0d0d;font-size:12pt;">If you have any questions or need assistance at any point, our dedicated support team is here to help. You can reach us by:</span></p>
    <ul>
        <li style="list-style-type:disc;color:#0d0d0d;font-size:12pt;">
            <p><span style="color:#0d0d0d;font-size:12pt;">Email: support@divinepos.com</span></p>
        </li>
        <li style="list-style-type:disc;color:#0d0d0d;font-size:12pt;">
            <p><span style="color:#0d0d0d;font-size:12pt;">Phone: 1 (833) 348 7671</span></p>
        </li>
    </ul>
    <p><span style="color:#0d0d0d;font-size:12pt;">Thank you for choosing Divine POS. We&apos;re excited to be part of your business growth and success. Make the most of your free trial and discover all the ways Divine POS can benefit your business.</span></p>
    <p><span style="color:#0d0d0d;font-size:12pt;">Best regards,</span></p>
    <p><span style="color:#0d0d0d;font-size:12pt;">The Divine POS Team</span></p>
</p>
                                    </div>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            <table style="font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                              <tbody style="line-height: inherit;">
                                <tr style="line-height: inherit;vertical-align: top;border-collapse: collapse;">
                                  <td style="overflow-wrap: break-word;word-break: break-word;padding: 0px 40px;font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" align="left">
                                    <!--[if mso
                                  ]>
																																<style>
                                    .v-button {
                                      background: transparent !important;
                                    }
                                  </style>
																																<!
                                [endif]-->
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            <!--[if (!mso)&(!IE)]>
																												<!-->
                          </div>
                          <!--

																											<![endif]-->
                        </div>
                      </div>
                      <!--[if (mso)|(IE)]>
																								</td>
																								<![endif]-->
                      <!--[if (mso)|(IE)]>
																							</tr>
																						</table>
																					</td>
																				</tr>
																			</table>
																			<![endif]-->
                    </div>
                  </div>
                </div>
                <div class="u-row-container" style="padding: 0px;background-color: transparent;line-height: inherit;">
                  <div class="u-row" style="margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #18163a;line-height: inherit;width: 100% !important;">
                    <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;line-height: inherit;">
                      <!--[if (mso)|(IE)]>
																			<table width="100%" cellpadding="0" cellspacing="0" border="0">
																				<tr>
																					<td style="padding: 0px;background-color: transparent;" align="center">
																						<table cellpadding="0" cellspacing="0" border="0" style="width:600px;">
																							<tr style="background-color: #18163a;">
																								<![endif]-->
                      <!--[if (mso)|(IE)]>
																								<td align="center" width="300" style="width: 300px;padding: 20px 20px 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top">
																									<![endif]-->
                      <div class="u-col u-col-50" style="max-width: 320px;min-width: 300px;display: table-cell;vertical-align: top;line-height: inherit;width: 300px !important;">
                        <div style="height: 100%;width: 100% !important;line-height: inherit;margin: 0 auto;">
                          <!--[if (!mso)&(!IE)]>
																											<!-->
                          <div style="box-sizing: border-box;height: 100%;padding: 20px 20px 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;line-height: inherit;">
                            <!--

																												<![endif]-->
                            <table style="font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                              <tbody style="line-height: inherit;">
                                <tr style="line-height: inherit;vertical-align: top;border-collapse: collapse;">
                                  <td style="overflow-wrap: break-word;word-break: break-word;padding: 10px;font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" align="left">
                                    <div style="
                                    font-size: 14px;
                                    line-height: 140%;
                                    text-align: left;
                                    word-wrap: break-word;
                                  ">
                                      <p style="font-size: 14px;line-height: 140%;margin: 0;">
                                        <span style="
                                        font-size: 16px;
                                        line-height: 22.4px;
                                        color: #ecf0f1;
                                      ">Contact </span>
                                      </p>
                                      <p style="font-size: 14px;line-height: 140%;margin: 0;">
                                        <span style="
                                        font-size: 14px;
                                        line-height: 19.6px;
                                        color: #ecf0f1;
                                      ">1 (833) 348-7671 </span>
                                      </p>
                                      <p style="font-size: 14px;line-height: 140%;margin: 0;">
                                        <span style="font-size: 14px; line-height: 19.6px; color: #ecf0f1;">
                                          <a href="mailto:support@divinepos.com" style="color: #ecf0f1;text-decoration: none;line-height: inherit;">support@divinepos.com</a>
                                        </span>
                                      </p>
                                    </div>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            <!--[if (!mso)&(!IE)]>
																												<!-->
                          </div>
                          <!--

																											<![endif]-->
                        </div>
                      </div>
                      <!--[if (mso)|(IE)]>
																								</td>
																								<![endif]-->
                      <!--[if (mso)|(IE)]>
																								<td align="center" width="300" style="width: 300px;padding: 0px 0px 0px 20px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top">
																									<![endif]-->
                      <div class="u-col u-col-50" style="max-width: 320px;min-width: 300px;display: table-cell;vertical-align: top;line-height: inherit;width: 300px !important;">
                        <div style="height: 100%;width: 100% !important;line-height: inherit;margin: 0 auto;">
                          <!--[if (!mso)&(!IE)]>
																											<!-->
                          <div style="box-sizing: border-box;height: 100%;padding: 0px 0px 0px 20px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;line-height: inherit;">
                            <!--

																												<![endif]-->
                            <table style="font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                              <tbody style="line-height: inherit;">
                                <tr style="line-height: inherit;vertical-align: top;border-collapse: collapse;">
                                  <td style="overflow-wrap: break-word;word-break: break-word;padding: 25px 10px 10px;font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" align="left">
                                    <div align="left" style="line-height: inherit;">
                                      <div style="display: table;max-width: 140px;line-height: inherit;">
                                        <!--[if (mso)|(IE)]>
																																		<table width="140" cellpadding="0" cellspacing="0" border="0">
																																			<tr>
																																				<td style="border-collapse:collapse;" align="left">
																																					<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse; mso-table-lspace: 0pt;mso-table-rspace: 0pt; width:140px;">
																																						<tr>
																																							<![endif]-->
                                        <!--[if (mso)|(IE)]>
																																							<td width="32" style="width:32px; padding-right: 15px;" valign="top">
																																								<![endif]-->
                                        <table align="left" border="0" cellspacing="0" cellpadding="0" width="32" height="32" style="width: 32px !important;height: 32px !important;display: inline-block;border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;margin-right: 15px;line-height: inherit;color: #000000;">
                                          <tbody style="line-height: inherit;">
                                            <tr style="vertical-align: top;line-height: inherit;border-collapse: collapse;">
                                              <td align="left" valign="middle" style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;line-height: inherit;color: #000000;">
                                                <a href=" https://www.facebook.com/divinepos" title="Facebook" target="_blank" style="line-height: inherit;color: #161a39;text-decoration: underline;">
                                                  <img src="https://drive.usercontent.google.com/download?id=1ztDO1YYb7VGlXXnVvFmuXhC5-fUmYy2U" alt="Facebook" title="Facebook" width="32" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: block !important;border: none;height: auto;float: none;max-width: 32px !important;line-height: inherit;">
                                                </a>
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                        <!--[if (mso)|(IE)]>
																																								</td>
																																								<![endif]-->
                                        <!--[if (mso)|(IE)]>
																																								<td width="32" style="width:32px; padding-right: 15px;" valign="top">
																																									<![endif]-->
                                        <table align="left" border="0" cellspacing="0" cellpadding="0" width="32" height="32" style="width: 32px !important;height: 32px !important;display: inline-block;border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;margin-right: 15px;line-height: inherit;color: #000000;">
                                          <tbody style="line-height: inherit;">
                                            <tr style="vertical-align: top;line-height: inherit;border-collapse: collapse;">
                                              <td align="left" valign="middle" style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;line-height: inherit;color: #000000;">
                                                <a href=" https://twitter.com/divine_pos" title="Twitter" target="_blank" style="line-height: inherit;color: #161a39;text-decoration: underline;">
                                                  <img src="https://drive.usercontent.google.com/download?id=1xKZwgFBoZlRX-G1p11NP9IMuTfVahMbz" alt="Twitter" title="Twitter" width="32" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: block !important;border: none;height: auto;float: none;max-width: 32px !important;line-height: inherit;">
                                                </a>
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                        <!--[if (mso)|(IE)]>
																																									</td>
																																									<![endif]-->
                                        <!--[if (mso)|(IE)]>
																																									<td width="32" style="width:32px; padding-right: 0px;" valign="top">
																																										<![endif]-->
                                        <table align="left" border="0" cellspacing="0" cellpadding="0" width="32" height="32" style="width: 32px !important;height: 32px !important;display: inline-block;border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;margin-right: 0px;line-height: inherit;color: #000000;">
                                          <tbody style="line-height: inherit;">
                                            <tr style="vertical-align: top;line-height: inherit;border-collapse: collapse;">
                                              <td align="left" valign="middle" style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;line-height: inherit;color: #000000;">
                                                <a href=" https://www.linkedin.com/company/divinepos" title="LinkedIn" target="_blank" style="line-height: inherit;color: #161a39;text-decoration: underline;">
                                                  <img src="https://drive.usercontent.google.com/download?id=158hro6-R56oDvPeo1ib9EADt5mJt5J4L" alt="LinkedIn" title="LinkedIn" width="32" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: block !important;border: none;height: auto;float: none;max-width: 32px !important;line-height: inherit;">
                                                </a>
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                        <!--[if (mso)|(IE)]>
																																										</td>
																																										<![endif]-->
                                        <!--[if (mso)|(IE)]>
																																									</tr>
																																								</table>
																																							</td>
																																						</tr>
																																					</table>
																																					<![endif]-->
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            <table style="font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                              <tbody style="line-height: inherit;">
                                <tr style="line-height: inherit;vertical-align: top;border-collapse: collapse;">
                                  <td style="overflow-wrap: break-word;word-break: break-word;padding: 5px 10px 10px;font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" align="left">
                                    <div style="
                                    font-size: 14px;
                                    line-height: 140%;
                                    text-align: left;
                                    word-wrap: break-word;
                                  ">
                                      <p style="line-height: 140%;font-size: 14px;margin: 0;">
                                        <span style="
                                        font-size: 14px;
                                        line-height: 19.6px;
                                      ">
                                          <span style="
                                          color: #ecf0f1;
                                          font-size: 14px;
                                          line-height: 19.6px;
                                        ">
                                            <span style="
                                            line-height: 19.6px;
                                            font-size: 14px;
                                          ">Divine POS © All Rights Reserved </span>
                                          </span>
                                        </span>
                                      </p>
                                    </div>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            <!--[if (!mso)&(!IE)]>
																															<!-->
                          </div>
                          <!--

																														<![endif]-->
                        </div>
                      </div>
                      <!--[if (mso)|(IE)]>
																											</td>
																											<![endif]-->
                      <!--[if (mso)|(IE)]>
																										</tr>
																									</table>
																								</td>
																							</tr>
																						</table>
																						<![endif]-->
                    </div>
                  </div>
                </div>
                <div class="u-row-container" style="padding: 0px;background-color: #f9f9f9;line-height: inherit;">
                  <div class="u-row" style="margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #1c103b;line-height: inherit;width: 100% !important;">
                    <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;line-height: inherit;">
                      <!--[if (mso)|(IE)]>
																						<table width="100%" cellpadding="0" cellspacing="0" border="0">
																							<tr>
																								<td style="padding: 0px;background-color: #f9f9f9;" align="center">
																									<table cellpadding="0" cellspacing="0" border="0" style="width:600px;">
																										<tr style="background-color: #1c103b;">
																											<![endif]-->
                      <!--[if (mso)|(IE)]>
																											<td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top">
																												<![endif]-->
                      <div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;line-height: inherit;width: 600px !important;">
                        <div style="height: 100%;width: 100% !important;line-height: inherit;margin: 0 auto;">
                          <!--[if (!mso)&(!IE)]>
																														<!-->
                          <div style="box-sizing: border-box;height: 100%;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;line-height: inherit;">
                            <!--

																															<![endif]-->
                            <table style="font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                              <tbody style="line-height: inherit;">
                                <tr style="line-height: inherit;vertical-align: top;border-collapse: collapse;">
                                  <td style="overflow-wrap: break-word;word-break: break-word;padding: 15px;font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" align="left">
                                    <table height="0px" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;border-top: 1px solid #1c103b;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;line-height: inherit;color: #000000;">
                                      <tbody style="line-height: inherit;">
                                        <tr style="vertical-align: top;line-height: inherit;border-collapse: collapse;">
                                          <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;font-size: 0px;line-height: 0px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;color: #000000;">
                                            <span style="line-height: inherit;">&#160;</span>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            <!--[if (!mso)&(!IE)]>
																															<!-->
                          </div>
                          <!--

																														<![endif]-->
                        </div>
                      </div>
                      <!--[if (mso)|(IE)]>
																											</td>
																											<![endif]-->
                      <!--[if (mso)|(IE)]>
																										</tr>
																									</table>
																								</td>
																							</tr>
																						</table>
																						<![endif]-->
                    </div>
                  </div>
                </div>
                <div class="u-row-container" style="padding: 0px;background-color: transparent;line-height: inherit;">
                  <div class="u-row" style="margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #f9f9f9;line-height: inherit;width: 100% !important;">
                    <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;line-height: inherit;">
                      <!--[if (mso)|(IE)]>
																						<table width="100%" cellpadding="0" cellspacing="0" border="0">
																							<tr>
																								<td style="padding: 0px;background-color: transparent;" align="center">
																									<table cellpadding="0" cellspacing="0" border="0" style="width:600px;">
																										<tr style="background-color: #f9f9f9;">
																											<![endif]-->
                      <!--[if (mso)|(IE)]>
																											<td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top">
																												<![endif]-->
                      <div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;line-height: inherit;width: 600px !important;">
                        <div style="height: 100%;width: 100% !important;line-height: inherit;margin: 0 auto;">
                          <!--[if (!mso)&(!IE)]>
																														<!-->
                          <div style="box-sizing: border-box;height: 100%;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;line-height: inherit;">
                            <!--

																															<![endif]-->
                            <table style="font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                              <tbody style="line-height: inherit;">
                                <tr style="line-height: inherit;vertical-align: top;border-collapse: collapse;">
                                  <td style="overflow-wrap: break-word;word-break: break-word;padding: 0px 40px 30px 20px;font-family: 'Lato', sans-serif;line-height: inherit;vertical-align: top;border-collapse: collapse;color: #000000;" align="left">
                                    <div style="
                                    font-size: 14px;
                                    line-height: 140%;
                                    text-align: left;
                                    word-wrap: break-word;
                                  "></div>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            <!--[if (!mso)&(!IE)]>
																															<!-->
                          </div>
                          <!--

																														<![endif]-->
                        </div>
                      </div>
                      <!--[if (mso)|(IE)]>
																											</td>
																											<![endif]-->
                      <!--[if (mso)|(IE)]>
																										</tr>
																									</table>
																								</td>
																							</tr>
																						</table>
																						<![endif]-->
                    </div>
                  </div>
                </div>
                <!--[if (mso)|(IE)]>
																		</td>
																	</tr>
																</table>
																<![endif]-->
              </td>
            </tr>
          </tbody>
        </table>
        <!--[if mso]>
											</div>
											<![endif]-->
        <!--[if IE]>
										</div>
										<![endif]-->
      </body>
    </html>
    `;
};

// ─── Delivery Platform Webhook ─────────────────────────────────────────────

import crypto from "crypto";

const PLATFORM_PREFIXES = {
  doordash: "DD",
  ubereats: "UE",
  skipthedishes: "SK",
  grubhub: "GH",
};

const VALID_PLATFORMS = ["doordash", "ubereats", "skipthedishes", "grubhub"];

function verifyWebhookSignature(platform, rawBody, secret, headers) {
  const signatureHeaders = {
    doordash: "x-doordash-signature",
    ubereats: "x-uber-signature",
    skipthedishes: "x-skip-signature",
    grubhub: "x-grubhub-signature",
  };
  const headerName = signatureHeaders[platform];
  const providedSignature = headers[headerName];
  if (!providedSignature || !secret) return false;
  const computed = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(providedSignature, "hex"), Buffer.from(computed, "hex"));
  } catch {
    return false;
  }
}

function normalizeDoorDashOrder(payload) {
  const order = payload.order || payload;
  const items = (order.items || order.order_items || []).map((item) => ({
    name: item.name || item.title || "",
    price: String(item.price || item.unit_price || "0"),
    quantity: String(item.quantity || "1"),
    options: (item.modifiers || item.options || []).map((m) => m.name || m.title || String(m)),
    extraDetails: item.special_instructions || item.instructions || "",
  }));
  const customer = order.customer || order.consumer || {};
  const address = order.delivery_address || order.address || {};
  return {
    cart: items,
    cartNote: order.special_instructions || order.notes || "",
    customer: {
      name: [customer.first_name, customer.last_name].filter(Boolean).join(" ") || customer.name || "DoorDash Customer",
      phone: customer.phone_number || customer.phone || "",
      address: { label: [address.street, address.city, address.state, address.zip_code].filter(Boolean).join(", ") },
      email: customer.email || "",
    },
    total: String(order.total || order.order_total || "0"),
    platformOrderId: String(order.id || order.order_id || ""),
  };
}

function normalizeUberEatsOrder(payload) {
  const order = payload.order || payload;
  const cart = order.cart || order.eater_order || {};
  const items = (cart.items || order.items || []).map((item) => ({
    name: item.title || item.name || "",
    price: String(item.price?.amount ? (item.price.amount / 100).toFixed(2) : item.price || "0"),
    quantity: String(item.quantity || "1"),
    options: (item.selected_modifier_groups || []).flatMap((g) => (g.selected_items || []).map((m) => m.title || m.name || "")),
    extraDetails: item.special_instructions || "",
  }));
  const eater = order.eater || order.customer || {};
  const deliveryInfo = order.delivery_info || order.dropoff || {};
  const location = deliveryInfo.location || deliveryInfo.address || {};
  return {
    cart: items,
    cartNote: order.special_instructions || order.eater_note || "",
    customer: {
      name: [eater.first_name, eater.last_name].filter(Boolean).join(" ") || eater.name || "Uber Eats Customer",
      phone: eater.phone?.number || eater.phone || "",
      address: { label: location.address || location.formatted_address || [location.street_address, location.city, location.state, location.zip_code].filter(Boolean).join(", ") },
      email: eater.email || "",
    },
    total: String(order.total?.amount ? (order.total.amount / 100).toFixed(2) : order.total || "0"),
    platformOrderId: String(order.id || order.order_id || ""),
  };
}

function normalizeSkipOrder(payload) {
  const order = payload.order || payload;
  const items = (order.items || order.order_items || []).map((item) => ({
    name: item.name || item.product_name || "",
    price: String(item.price || item.total_price || "0"),
    quantity: String(item.quantity || "1"),
    options: (item.modifiers || item.customizations || []).map((m) => m.name || String(m)),
    extraDetails: item.special_instructions || "",
  }));
  const customer = order.customer || {};
  const address = order.delivery_address || order.address || {};
  return {
    cart: items,
    cartNote: order.notes || order.special_instructions || "",
    customer: {
      name: customer.name || [customer.first_name, customer.last_name].filter(Boolean).join(" ") || "Skip Customer",
      phone: customer.phone || customer.phone_number || "",
      address: { label: [address.street, address.city, address.province, address.postal_code].filter(Boolean).join(", ") },
      email: customer.email || "",
    },
    total: String(order.total || order.order_total || "0"),
    platformOrderId: String(order.id || order.order_id || ""),
  };
}

function normalizeGrubhubOrder(payload) {
  const order = payload.order || payload;
  const items = (order.line_items || order.items || []).map((item) => ({
    name: item.name || item.menu_item_name || "",
    price: String(item.price || item.total || "0"),
    quantity: String(item.quantity || "1"),
    options: (item.modifiers || item.options || []).map((m) => m.name || m.modifier_name || String(m)),
    extraDetails: item.special_instructions || "",
  }));
  const customer = order.customer || order.diner || {};
  const address = order.delivery_address || order.address || {};
  return {
    cart: items,
    cartNote: order.special_instructions || order.order_note || "",
    customer: {
      name: [customer.first_name, customer.last_name].filter(Boolean).join(" ") || customer.name || "Grubhub Customer",
      phone: customer.phone || "",
      address: { label: [address.street_address, address.city, address.state, address.zip].filter(Boolean).join(", ") },
      email: customer.email || "",
    },
    total: String(order.total || order.order_total || "0"),
    platformOrderId: String(order.id || order.order_id || ""),
  };
}

const normalizers = {
  doordash: normalizeDoorDashOrder,
  ubereats: normalizeUberEatsOrder,
  skipthedishes: normalizeSkipOrder,
  grubhub: normalizeGrubhubOrder,
};

export const deliveryWebhook = onRequest(async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const pathParts = req.path.split("/").filter(Boolean);
  let uid, platform;
  if (pathParts.length >= 3) {
    uid = pathParts[pathParts.length - 2];
    platform = pathParts[pathParts.length - 1];
  } else if (pathParts.length === 2) {
    uid = pathParts[0];
    platform = pathParts[1];
  } else {
    return res.status(400).json({ error: "Invalid URL format" });
  }

  if (!VALID_PLATFORMS.includes(platform)) {
    return res.status(400).json({ error: `Invalid platform: ${platform}` });
  }

  try {
    const userDoc = await db.collection("users").doc(uid).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    const subsSnapshot = await db.collection("users").doc(uid).collection("subscriptions").get();
    let isProfessional = false;
    subsSnapshot.forEach((doc) => {
      const sub = doc.data();
      if ((sub.role === "Professional Plan" || sub.role === "Premium Plan") && sub.status === "active") {
        isProfessional = true;
      }
    });
    if (!isProfessional) {
      return res.status(403).json({ error: "Professional plan required" });
    }

    const userData = userDoc.data();
    const platformConfig = userData?.deliveryPlatforms?.[platform];
    if (!platformConfig?.enabled) {
      return res.status(403).json({ error: `${platform} integration is not enabled` });
    }

    const rawBody = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
    if (platformConfig.webhookSecret) {
      const isValid = verifyWebhookSignature(platform, rawBody, platformConfig.webhookSecret, req.headers);
      if (!isValid) {
        console.warn(`Invalid webhook signature for ${platform}, uid: ${uid}`);
        return res.status(401).json({ error: "Invalid webhook signature" });
      }
    }

    const payload = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const normalizer = normalizers[platform];
    const normalized = normalizer(payload);

    if (!normalized.platformOrderId) {
      return res.status(400).json({ error: "Could not extract order ID from payload" });
    }

    const existingOrders = await db
      .collection("users").doc(uid).collection("deliveryOrders")
      .where("platformOrderId", "==", normalized.platformOrderId)
      .where("platform", "==", platform)
      .limit(1).get();

    if (!existingOrders.empty) {
      return res.status(200).json({ message: "Order already processed" });
    }

    const prefix = PLATFORM_PREFIXES[platform] || "DL";
    const pendingOrder = {
      cart: normalized.cart,
      cartNote: normalized.cartNote,
      customer: normalized.customer,
      date: admin.firestore.Timestamp.now(),
      method: "deliveryOrder",
      online: true,
      transNum: `${prefix}-${normalized.platformOrderId}`,
      total: normalized.total,
      printed: false,
      paymentMethod: "Prepaid",
      deliveryPlatform: platform,
      platformOrderId: normalized.platformOrderId,
    };

    const pendingRef = await db.collection("users").doc(uid).collection("pendingOrders").add(pendingOrder);

    await db.collection("users").doc(uid).collection("deliveryOrders").add({
      platformOrderId: normalized.platformOrderId,
      platform: platform,
      pendingOrderId: pendingRef.id,
      receivedAt: admin.firestore.Timestamp.now(),
      status: "received",
    });

    return res.status(200).json({ success: true, message: "Order received", orderId: pendingRef.id });
  } catch (error) {
    console.error("Delivery webhook error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// FRANCHISE FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

// ─── Create a new franchise location (callable, hub owner or superadmin) ───
export const createFranchiseLocation = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Must be logged in");
  }

  const callerUid = context.auth.uid;
  const isSuperAdmin = callerUid === SUPERADMIN_UID;

  // Verify caller is hub owner or superadmin
  if (!isSuperAdmin) {
    const callerDoc = await db.collection("users").doc(callerUid).get();
    if (!callerDoc.exists || callerDoc.data()?.franchiseRole !== "hub") {
      throw new functions.https.HttpsError("permission-denied", "Only franchise hub owner or superadmin can create locations");
    }
  }

  const { hubUid, email, password, locationName, address, phoneNumber, acceptDelivery, deliveryPrice, deliveryRange, taxRate } = data;

  if (!hubUid || !email || !password || !locationName) {
    throw new functions.https.HttpsError("invalid-argument", "Missing required fields: hubUid, email, password, locationName");
  }

  // If not superadmin, caller must be the hub owner
  if (!isSuperAdmin && callerUid !== hubUid) {
    throw new functions.https.HttpsError("permission-denied", "You can only add locations to your own franchise");
  }

  try {
    // 1. Verify the franchise exists
    const franchiseDoc = await db.collection("franchises").doc(hubUid).get();
    if (!franchiseDoc.exists) {
      throw new functions.https.HttpsError("not-found", "Franchise not found");
    }

    // 2. Read hub's data to copy products, categories, option templates
    const hubDoc = await db.collection("users").doc(hubUid).get();
    const hubData = hubDoc.data() || {};
    const hubProducts = await db.collection("users").doc(hubUid).collection("products").get();
    const hubTemplates = await db.collection("users").doc(hubUid).collection("optionTemplates").get();

    // 3. Create Firebase Auth user for the new location
    const newUser = await admin.auth().createUser({
      email,
      password,
      displayName: locationName,
    });
    const newUid = newUser.uid;

    // 4. Initialize the location's user doc (copy structure from hub)
    const locationStoreDetails = {
      ...(hubData.storeDetails || {}),
      name: locationName,
      address: address || null,
      phoneNumber: phoneNumber || "",
      deliveryPrice: deliveryPrice || hubData.storeDetails?.deliveryPrice || "",
      deliveryRange: deliveryRange || hubData.storeDetails?.deliveryRange || "",
      acceptDelivery: acceptDelivery ?? hubData.storeDetails?.acceptDelivery ?? false,
      taxRate: taxRate || hubData.storeDetails?.taxRate || "13",
    };

    await db.collection("users").doc(newUid).set({
      categories: hubData.categories || [],
      storeDetails: locationStoreDetails,
      wooCredentials: { apiUrl: "", ck: "", cs: "", useWoocommerce: false },
      franchiseId: hubUid,
      franchiseRole: "location",
      ownerDetails: { email },
    });

    // 5. Copy products from hub (strip stock fields — each location manages its own)
    const productBatch = db.batch();
    let batchCount = 0;
    const batches = [productBatch];

    hubProducts.forEach((productDoc) => {
      const product = productDoc.data();
      const syncedProduct = { ...product };
      delete syncedProduct.stockQuantity;
      delete syncedProduct.lowStockThreshold;
      delete syncedProduct.trackStock;

      let currentBatch = batches[batches.length - 1];
      if (batchCount >= 490) {
        currentBatch = db.batch();
        batches.push(currentBatch);
        batchCount = 0;
      }

      currentBatch.set(
        db.collection("users").doc(newUid).collection("products").doc(productDoc.id),
        syncedProduct
      );
      batchCount++;
    });

    for (const b of batches) {
      await b.commit();
    }

    // 6. Copy option templates from hub
    const templateBatch = db.batch();
    hubTemplates.forEach((tmplDoc) => {
      templateBatch.set(
        db.collection("users").doc(newUid).collection("optionTemplates").doc(tmplDoc.id),
        tmplDoc.data()
      );
    });
    await templateBatch.commit();

    // 7. Create synthetic subscription so location is treated as Professional
    await db.collection("users").doc(newUid).collection("subscriptions").doc("franchise-managed").set({
      role: "Professional Plan",
      status: "active",
      created: admin.firestore.FieldValue.serverTimestamp(),
      metadata: { source: "franchise", managedByFranchise: hubUid },
    });

    // 8. Add location to franchise doc
    const locationInfo = {
      uid: newUid,
      name: locationName,
      address: address || null,
      phoneNumber: phoneNumber || "",
      isActive: true,
      acceptDelivery: acceptDelivery ?? false,
      deliveryPrice: deliveryPrice || "",
      deliveryRange: deliveryRange || "",
    };

    await db.collection("franchises").doc(hubUid).collection("locations").doc(newUid).set(locationInfo);
    await db.collection("franchises").doc(hubUid).update({
      locationUids: admin.firestore.FieldValue.arrayUnion(newUid),
    });

    // 9. Update the franchise public doc with new location
    const franchiseData = franchiseDoc.data();
    const publicDoc = await db.collection("public").doc(hubUid).get();
    const currentLocations = publicDoc.exists ? (publicDoc.data()?.locations || []) : [];
    currentLocations.push(locationInfo);
    if (publicDoc.exists) {
      await db.collection("public").doc(hubUid).update({
        locations: currentLocations,
      });
    } else {
      await db.collection("public").doc(hubUid).set({
        isFranchise: true,
        urlEnding: franchiseData?.urlEnding || "",
        storeDetails: hubData.storeDetails || {},
        categories: hubData.categories || [],
        brandColor: franchiseData?.brandColor || "",
        tagline: franchiseData?.tagline || "",
        logoUrl: franchiseData?.logoUrl || "",
        onlineStoreActive: true,
        locations: currentLocations,
      });
    }

    return { success: true, locationUid: newUid, email };
  } catch (err) {
    console.error("createFranchiseLocation failed:", err);
    if (err instanceof functions.https.HttpsError) throw err;
    throw new functions.https.HttpsError("internal", err.message || "Failed to create location");
  }
});

// ─── Rebuild franchise public doc locations array from live location data ───
export const rebuildFranchiseLocations = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Must be logged in");
  }
  // Allow superadmin OR the hub owner to call this
  const { hubUid } = data;
  if (!hubUid) throw new functions.https.HttpsError("invalid-argument", "Missing hubUid");
  if (context.auth.uid !== SUPERADMIN_UID && context.auth.uid !== hubUid) {
    throw new functions.https.HttpsError("permission-denied", "Not authorized");
  }

  const locSnap = await db.collection("franchises").doc(hubUid).collection("locations").get();
  const locations = [];

  for (const loc of locSnap.docs) {
    const locData = loc.data();
    // Read LIVE data from the location's actual user doc
    const userDoc = await db.collection("users").doc(loc.id).get();
    const userData = userDoc.exists ? userDoc.data() : {};
    const storeDetails = userData?.storeDetails || {};

    const locationInfo = {
      uid: loc.id,
      name: locData.name || storeDetails.name || "",
      address: storeDetails.address || locData.address || null,
      phoneNumber: storeDetails.phoneNumber || locData.phoneNumber || "",
      isActive: locData.isActive !== false,
      acceptDelivery: storeDetails.acceptDelivery ?? locData.acceptDelivery ?? false,
      deliveryPrice: storeDetails.deliveryPrice || locData.deliveryPrice || "",
      deliveryRange: storeDetails.deliveryRange || locData.deliveryRange || "",
      stripePublicKey: userData?.stripePublicKey || storeDetails.stripePublicKey || "",
    };

    locations.push(locationInfo);

    // Also update the franchise subcollection with latest data
    await db.collection("franchises").doc(hubUid).collection("locations").doc(loc.id).update(locationInfo);

    // Ensure location user doc has franchise fields set
    const locUserData = userDoc.exists ? userDoc.data() : {};
    if (locUserData?.franchiseRole !== "location" || locUserData?.franchiseId !== hubUid) {
      await db.collection("users").doc(loc.id).update({
        franchiseRole: "location",
        franchiseId: hubUid,
      });
    }

    // Ensure location has franchise-managed subscription
    const subDoc = await db.collection("users").doc(loc.id).collection("subscriptions").doc("franchise-managed").get();
    if (!subDoc.exists) {
      await db.collection("users").doc(loc.id).collection("subscriptions").doc("franchise-managed").set({
        role: "Professional Plan",
        status: "active",
        created: admin.firestore.FieldValue.serverTimestamp(),
        metadata: { source: "franchise", managedByFranchise: hubUid },
      });
    }
  }

  await db.collection("public").doc(hubUid).update({ locations });
  return { success: true, count: locations.length };
});

// ─── Firestore trigger: Auto-sync location settings to franchise public doc ───
export const onLocationSettingsChange = functions.firestore
  .document("users/{uid}")
  .onUpdate(async (change, context) => {
    const uid = context.params.uid;
    const before = change.before.data();
    const after = change.after.data();

    // Only trigger for franchise locations
    if (after?.franchiseRole !== "location" || !after?.franchiseId) return;

    // Only trigger if storeDetails or Stripe keys changed
    const beforeDetails = JSON.stringify(before?.storeDetails || {});
    const afterDetails = JSON.stringify(after?.storeDetails || {});
    const stripeChanged = (before?.stripePublicKey || "") !== (after?.stripePublicKey || "");
    if (beforeDetails === afterDetails && !stripeChanged) return;

    const hubUid = after.franchiseId;
    const storeDetails = after.storeDetails || {};

    // Update the location entry in the franchise public doc
    try {
      const publicDoc = await db.collection("public").doc(hubUid).get();
      if (!publicDoc.exists) return;

      const locations = publicDoc.data()?.locations || [];
      const locIndex = locations.findIndex((l) => l.uid === uid);
      if (locIndex === -1) return;

      locations[locIndex] = {
        ...locations[locIndex],
        address: storeDetails.address || locations[locIndex].address,
        phoneNumber: storeDetails.phoneNumber || locations[locIndex].phoneNumber,
        acceptDelivery: storeDetails.acceptDelivery ?? locations[locIndex].acceptDelivery,
        deliveryPrice: storeDetails.deliveryPrice || locations[locIndex].deliveryPrice,
        deliveryRange: storeDetails.deliveryRange || locations[locIndex].deliveryRange,
        stripePublicKey: after.stripePublicKey || storeDetails.stripePublicKey || locations[locIndex].stripePublicKey || "",
      };

      await db.collection("public").doc(hubUid).update({ locations });

      // Also update franchise subcollection
      await db.collection("franchises").doc(hubUid).collection("locations").doc(uid).update({
        address: storeDetails.address || null,
        phoneNumber: storeDetails.phoneNumber || "",
        acceptDelivery: storeDetails.acceptDelivery ?? false,
        deliveryPrice: storeDetails.deliveryPrice || "",
        deliveryRange: storeDetails.deliveryRange || "",
        stripePublicKey: after.stripePublicKey || storeDetails.stripePublicKey || "",
      });
    } catch (err) {
      console.error("onLocationSettingsChange failed:", err);
    }
  });

// ─── Delete a franchise (superadmin only) ───
export const deleteFranchise = functions.https.onCall(async (data, context) => {
  if (!context.auth || context.auth.uid !== SUPERADMIN_UID) {
    throw new functions.https.HttpsError("permission-denied", "Not authorized");
  }

  const { hubUid, deleteLocationAccounts } = data;
  if (!hubUid) throw new functions.https.HttpsError("invalid-argument", "Missing hubUid");

  try {
    // Get all location UIDs
    const franchiseDoc = await db.collection("franchises").doc(hubUid).get();
    if (!franchiseDoc.exists) throw new functions.https.HttpsError("not-found", "Franchise not found");

    const locationUids = franchiseDoc.data()?.locationUids || [];

    // Remove franchise role from all location user docs
    for (const locUid of locationUids) {
      if (deleteLocationAccounts) {
        // Delete the location account entirely
        await admin.firestore().recursiveDelete(db.collection("users").doc(locUid));
        await admin.firestore().recursiveDelete(db.collection("public").doc(locUid));
        await admin.auth().deleteUser(locUid).catch(() => {});
      } else {
        // Just remove franchise fields
        await db.collection("users").doc(locUid).update({
          franchiseId: admin.firestore.FieldValue.delete(),
          franchiseRole: admin.firestore.FieldValue.delete(),
        }).catch(() => {});
        // Remove franchise-managed subscription
        await db.collection("users").doc(locUid).collection("subscriptions").doc("franchise-managed").delete().catch(() => {});
      }
    }

    // Remove franchise role from hub user doc
    await db.collection("users").doc(hubUid).update({
      franchiseId: admin.firestore.FieldValue.delete(),
      franchiseRole: admin.firestore.FieldValue.delete(),
      onlineStoreSetUp: admin.firestore.FieldValue.delete(),
      onlineStoreActive: admin.firestore.FieldValue.delete(),
    }).catch(() => {});

    // Remove franchise-hub subscription
    await db.collection("users").doc(hubUid).collection("subscriptions").doc("franchise-hub").delete().catch(() => {});

    // Delete franchise doc and subcollections
    await admin.firestore().recursiveDelete(db.collection("franchises").doc(hubUid));

    // Clean up public doc (remove isFranchise, locations)
    await db.collection("public").doc(hubUid).update({
      isFranchise: admin.firestore.FieldValue.delete(),
      locations: admin.firestore.FieldValue.delete(),
    }).catch(() => {});

    return { success: true, deletedLocations: deleteLocationAccounts ? locationUids.length : 0 };
  } catch (err) {
    console.error("deleteFranchise failed:", err);
    if (err instanceof functions.https.HttpsError) throw err;
    throw new functions.https.HttpsError("internal", err.message || "Failed to delete franchise");
  }
});

// ─── Firestore trigger: Sync product changes from hub to all locations ───
export const onHubProductWrite = functions.firestore
  .document("users/{uid}/products/{productId}")
  .onWrite(async (change, context) => {
    const uid = context.params.uid;
    const productId = context.params.productId;

    // Check if this user is a franchise hub
    const userDoc = await db.collection("users").doc(uid).get();
    if (!userDoc.exists || userDoc.data()?.franchiseRole !== "hub") return;

    const franchiseDoc = await db.collection("franchises").doc(uid).get();
    if (!franchiseDoc.exists) return;

    const locationUids = franchiseDoc.data()?.locationUids || [];
    if (locationUids.length === 0) return;

    // Chunk writes into batches of 490 (leave room for batch overhead)
    const BATCH_LIMIT = 490;
    let currentBatch = db.batch();
    let opCount = 0;
    const batches = [currentBatch];

    const getNextBatch = () => {
      if (opCount >= BATCH_LIMIT) {
        currentBatch = db.batch();
        batches.push(currentBatch);
        opCount = 0;
      }
      return currentBatch;
    };

    if (!change.after.exists) {
      // Product was deleted — delete from all locations
      for (const locUid of locationUids) {
        getNextBatch().delete(db.collection("users").doc(locUid).collection("products").doc(productId));
        opCount++;
        getNextBatch().delete(db.collection("public").doc(locUid).collection("products").doc(productId));
        opCount++;
      }
      // Also delete from hub's public collection
      getNextBatch().delete(db.collection("public").doc(uid).collection("products").doc(productId));
      opCount++;
    } else {
      // Product was created or updated — sync to all locations
      const product = change.after.data();
      // Strip stock fields — each location manages its own inventory
      const syncProduct = { ...product };
      delete syncProduct.stockQuantity;
      delete syncProduct.lowStockThreshold;
      delete syncProduct.trackStock;

      for (const locUid of locationUids) {
        getNextBatch().set(
          db.collection("users").doc(locUid).collection("products").doc(productId),
          syncProduct,
          { merge: true }
        );
        opCount++;
        getNextBatch().set(
          db.collection("public").doc(locUid).collection("products").doc(productId),
          syncProduct,
          { merge: true }
        );
        opCount++;
      }
      // Also sync to hub's public collection
      getNextBatch().set(
        db.collection("public").doc(uid).collection("products").doc(productId),
        product,
        { merge: true }
      );
      opCount++;
    }

    // Commit all batches
    for (const b of batches) {
      await b.commit();
    }
  });

// ─── Firestore trigger: Sync category changes from hub to all locations ───
export const onHubCategoryChange = functions.firestore
  .document("users/{uid}")
  .onUpdate(async (change, context) => {
    const uid = context.params.uid;
    const before = change.before.data();
    const after = change.after.data();

    // Only trigger if categories actually changed
    if (JSON.stringify(before?.categories) === JSON.stringify(after?.categories)) return;

    // Check if this user is a franchise hub
    if (after?.franchiseRole !== "hub") return;

    const franchiseDoc = await db.collection("franchises").doc(uid).get();
    if (!franchiseDoc.exists) return;

    const locationUids = franchiseDoc.data()?.locationUids || [];
    if (locationUids.length === 0) return;

    const newCategories = after?.categories || [];
    const batch = db.batch();

    for (const locUid of locationUids) {
      batch.update(db.collection("users").doc(locUid), { categories: newCategories });
      // Also update public docs if they exist
      batch.set(db.collection("public").doc(locUid), { categories: newCategories }, { merge: true });
    }

    // Update hub's public doc
    batch.set(db.collection("public").doc(uid), { categories: newCategories }, { merge: true });

    await batch.commit();
  });

// ─── Create franchise from existing account (superadmin only) ───
export const createFranchise = functions.https.onCall(async (data, context) => {
  if (!context.auth || context.auth.uid !== SUPERADMIN_UID) {
    throw new functions.https.HttpsError("permission-denied", "Not authorized");
  }

  const { uid, name, urlEnding } = data;
  if (!uid || !name) {
    throw new functions.https.HttpsError("invalid-argument", "Missing uid or name");
  }

  try {
    // Verify user exists and is not already in a franchise
    const userDoc = await db.collection("users").doc(uid).get();
    if (!userDoc.exists) {
      throw new functions.https.HttpsError("not-found", "User not found");
    }
    if (userDoc.data()?.franchiseRole) {
      throw new functions.https.HttpsError("already-exists", "User is already part of a franchise");
    }

    const userData = userDoc.data() || {};

    // Generate URL slug from franchise name if not provided
    const slug = (urlEnding || userData.urlEnding || name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "")).toLowerCase();

    // Create franchise doc
    await db.collection("franchises").doc(uid).set({
      hubUid: uid,
      name,
      locationUids: [],
      urlEnding: slug,
      brandColor: userData.brandColor || "",
      tagline: userData.tagline || "",
      logoUrl: userData.storeDetails?.logoUrl || "",
      onlineStoreActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Update user doc with franchise role + auto-setup online store
    await db.collection("users").doc(uid).update({
      franchiseId: uid,
      franchiseRole: "hub",
      onlineStoreSetUp: true,
      onlineStoreActive: true,
      urlEnding: slug,
    });

    // Give hub account Professional subscription (franchise includes all features)
    await db.collection("users").doc(uid).collection("subscriptions").doc("franchise-hub").set({
      role: "Professional Plan",
      status: "active",
      created: admin.firestore.FieldValue.serverTimestamp(),
      metadata: { source: "franchise-hub" },
    });

    // Create/update public doc for franchise online store
    await db.collection("public").doc(uid).set({
      isFranchise: true,
      urlEnding: slug,
      storeDetails: userData.storeDetails || {},
      categories: userData.categories || [],
      brandColor: userData.brandColor || "",
      tagline: userData.tagline || "",
      logoUrl: userData.storeDetails?.logoUrl || "",
      onlineStoreActive: true,
      onlineStoreSetUp: true,
      locations: [],
    }, { merge: true });

    return { success: true };
  } catch (err) {
    console.error("createFranchise failed:", err);
    if (err instanceof functions.https.HttpsError) throw err;
    throw new functions.https.HttpsError("internal", err.message || "Failed to create franchise");
  }
});
