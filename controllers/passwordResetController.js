
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import prisma from "../config/prisma.js";
import transporter from "../config/email.js";
import { sendResponse, serverError } from "../utils/response.js";

const RESET_TOKEN_EXPIRY = 15 * 60 * 1000;
const PASSWORD_SALT_ROUNDS = 12;

const hashResetToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return sendResponse(res, 400, "Email is required");
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    const successMessage =
      "If the account exists, a reset link will be sent.";

    if (!user) {
      return sendResponse(res, 200, successMessage);
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashResetToken(resetToken);

    const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY);

    await prisma.passwordResetToken.upsert({
      where: { userId: user.id },
      update: { tokenHash, expiresAt },
      create: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    const resetLink =
      `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Reset your password",
        text: `Use this link to reset your password: ${resetLink}\nThis link expires in 15 minutes.`,
      });
    } catch (emailError) {
      await prisma.passwordResetToken.deleteMany({
        where: { userId: user.id, tokenHash },
      });

      throw emailError;
    }

    return sendResponse(res, 200, successMessage);
  } catch (error) {
    console.error("Forgot password error:", error);
    return serverError(res);
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (
      typeof token !== "string" ||
      typeof newPassword !== "string" ||
      newPassword.length < 8
    ) {
      return sendResponse(
        res,
        400,
        "A valid token and password of at least 8 characters are required."
      );
    }

    const tokenHash = hashResetToken(token);

    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    if (!resetRecord || resetRecord.expiresAt <= new Date()) {
      return sendResponse(
        res,
        400,
        "Reset link is invalid or expired."
      );
    }

    const passwordHash = await bcrypt.hash(
      newPassword,
      PASSWORD_SALT_ROUNDS
    );

    await prisma.$transaction(async (tx) => {
      const consumedToken = await tx.passwordResetToken.deleteMany({
        where: {
          id: resetRecord.id,
          tokenHash,
          expiresAt: { gt: new Date() },
        },
      });

      if (consumedToken.count !== 1) {
        throw new Error("RESET_TOKEN_INVALID");
      }

      await tx.user.update({
        where: { id: resetRecord.userId },
        data: { passwordHash },
      });
    });

    return sendResponse(
      res,
      200,
      "Password reset successful. Please log in again."
    );
  } catch (error) {
    if (error.message === "RESET_TOKEN_INVALID") {
      return sendResponse(
        res,
        400,
        "Reset link is invalid or expired."
      );
    }

    console.error("Reset password error:", error);
    return serverError(res);
  }
};
