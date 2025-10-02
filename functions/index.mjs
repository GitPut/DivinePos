// Importing modules with ES6 syntax
import admin from "firebase-admin";
import nodemailer from "nodemailer";
import stripe from "stripe";
import cors from "cors";
import axios from "axios";
import { onRequest } from "firebase-functions/v2/https";
import * as functions from "firebase-functions/v1";

// Additional constants
const GOOGLE_API_KEY = "AIzaSyDjx4LBIEDNRYKEt-0_TJ6jUcst4a2YON4";

// Handling the cors initialization separately as it needs specific handling
const corsHandler = cors({ origin: true });

admin.initializeApp();

const db = admin.firestore();

//create and config transporter
let transporter = nodemailer.createTransport({
  // name: "outlook.office365.com",
  host: "smtp.office365.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  requireTLS: true,
  auth: {
    user: "support@divinepos.com",
    pass: "20Peter12",
  },
  tls: {
    ciphers: "SSLv3",
  },
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
          "auth.divinepos"
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

      // Fetch the secret key from Firestore or Realtime Database
      const configSnapshot = await db.collection("users").doc(storeUID).get();
      const secretKey = configSnapshot.data().stripeSecretKey;

      const charge = await stripe(secretKey).charges.create({
        amount: amount * 100,
        currency: currency || "cad",
        source: token,
      });

      // console.log("Payment succeeded:", charge);

      await db
        .collection("users")
        .doc(storeUID)
        .collection("pendingOrders")
        .add(orderDetails);

      const mailOptions = {
        from: "support@divinepos.com",
        to: orderDetails.customer.email,
        subject: "Order Confirmation",
        html: OrderConfirmationEmailHtml(orderDetails, storeDetails),
      };
      return transporter.sendMail(mailOptions, (error, data) => {
        if (error) {
          return res.send(error.toString());
        }
        res.status(200).json({ success: true, message: "Payment succeeded" });
      });
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
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry&key=${GOOGLE_API_KEY}`
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
                                    cartItem.price
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
                                    element.total
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
