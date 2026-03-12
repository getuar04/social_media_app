import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import * as dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const loadTemplate = (templateName) => {
  const templatePath = path.join(
    __dirname,
    
    "../templates",
    `${templateName}.html`,
  );

  return fs.readFileSync(templatePath, "utf-8");
};

const replaceVariables = (template, variables) => {
  return template.replace(/{{\s*(\w+)\s*}}/g, (_, key) => {
    return variables[key] || "";
  });
};

export const verifyTransporter = async () => {
  try {
    await new Promise((resolve, reject) => {
      transporter.verify((error) => {
        if (error) reject(error);
        else resolve();
      });
    });

    console.log("✅ SMTP transporter is ready to send emails");
  } catch (error) {
    console.error("❌ SMTP verification failed:", error);
  }
};

export const sendEmail = async ({ to, subject, templateName, variables }) => {
  try {
    const rawTemplate = loadTemplate(templateName);
    const html = replaceVariables(rawTemplate, variables);

    const info = await transporter.sendMail({
      from: `"My App" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    console.log("➗ info:", info);
  } catch (error) {
    console.error("Error sending email:", error);

    if (error instanceof Error) {
      console.error("Error details:", error.message);
    }

    throw new Error("Failed to send email. Please try again later.");
  }
};
