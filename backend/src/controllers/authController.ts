import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Resend } from 'resend';
import prisma from '../utils/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
const resend = new Resend(process.env.RESEND_API_KEY);

const validateEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const register = async (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  
  if (!validateEmail(email)) {
    return res.status(400).json({ message: 'Format d\'email invalide' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Le mot de passe doit faire au moins 6 caractères' });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Cet utilisateur existe déjà' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpiry = new Date(Date.now() + 24 * 3600000); // 24 heures

    await prisma.user.create({
      data: { 
        email, 
        password: hashedPassword, 
        name,
        verificationCode,
        verificationCodeExpiry,
        isVerified: false
      },
    });

    if (process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: 'EcoTrace <onboarding@resend.dev>',
          to: email,
          subject: 'Code de vérification - EcoTrace',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #6d28d9;">EcoTrace</h2>
              <p>Bonjour ${name},</p>
              <p>Merci de vous être inscrit sur EcoTrace. Voici votre code de vérification :</p>
              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 12px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #6d28d9; margin: 20px 0;">
                ${verificationCode}
              </div>
              <p style="margin-top: 20px; font-size: 14px; color: #64748b;">Ce code est valable pendant 24 heures. Si vous n'êtes pas à l'origine de cette inscription, vous pouvez ignorer cet email.</p>
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
              <p style="font-size: 12px; color: #94a3b8;">L'équipe EcoTrace</p>
            </div>
          `
        });
      } catch (emailError) {
        console.error('Erreur Resend:', emailError);
      }
    } else {
      console.log(`[MODE DEBUG] Code de vérification pour ${email}: ${verificationCode}`);
    }

    res.status(201).json({ 
      message: 'Inscription réussie. Veuillez vérifier votre email pour le code de confirmation.',
      email,
      debugCode: process.env.RESEND_API_KEY ? undefined : verificationCode
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'inscription', error: String(error) });
  }
};

export const resendCode = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(400).json({ message: 'Utilisateur non trouvé' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Cet email est déjà vérifié' });
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpiry = new Date(Date.now() + 24 * 3600000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationCode,
        verificationCodeExpiry
      }
    });

    if (process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: 'EcoTrace <onboarding@resend.dev>',
          to: email,
          subject: 'Nouveau code de vérification - EcoTrace',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #6d28d9;">EcoTrace</h2>
              <p>Bonjour ${user.name},</p>
              <p>Voici votre nouveau code de vérification :</p>
              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 12px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #6d28d9; margin: 20px 0;">
                ${verificationCode}
              </div>
              <p style="margin-top: 20px; font-size: 14px; color: #64748b;">Ce code est valable pendant 24 heures.</p>
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
              <p style="font-size: 12px; color: #94a3b8;">L'équipe EcoTrace</p>
            </div>
          `
        });
      } catch (emailError) {
        console.error('Erreur Resend:', emailError);
      }
    }

    res.json({ 
      message: 'Un nouveau code a été envoyé.',
      debugCode: process.env.RESEND_API_KEY ? undefined : verificationCode
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors du renvoi du code', error: String(error) });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  const { email, code } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(400).json({ message: 'Utilisateur non trouvé' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Cet email est déjà vérifié' });
    }

    if (user.verificationCode !== code || (user.verificationCodeExpiry && user.verificationCodeExpiry < new Date())) {
      return res.status(400).json({ message: 'Code invalide ou expiré' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationCode: null,
        verificationCodeExpiry: null
      }
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ 
      message: 'Email vérifié avec succès', 
      token, 
      user: { id: user.id, email: user.email, name: user.name } 
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la vérification', error: String(error) });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!validateEmail(email)) {
    return res.status(400).json({ message: 'Format d\'email invalide' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Identifiants invalides' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Veuillez vérifier votre email avant de vous connecter', needsVerification: true, email: user.email });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Identifiants invalides' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la connexion', error });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!validateEmail(email)) {
    return res.status(400).json({ message: 'Format d\'email invalide' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.json({ message: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 heure

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry },
    });

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetLink = `${baseUrl}/reset-password/${resetToken}`;

    if (process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: 'EcoTrace <onboarding@resend.dev>',
          to: user.email,
          subject: 'Réinitialisation de votre mot de passe - EcoTrace',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #6d28d9;">EcoTrace</h2>
              <p>Bonjour ${user.name},</p>
              <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte EcoTrace.</p>
              <p>Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe :</p>
              <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #6d28d9; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Réinitialiser mon mot de passe</a>
              <p style="margin-top: 20px; font-size: 14px; color: #64748b;">Ce lien expirera dans 1 heure. Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email.</p>
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
              <p style="font-size: 12px; color: #94a3b8;">L'équipe EcoTrace</p>
            </div>
          `
        });
      } catch (emailError) {
        console.error('Erreur Resend:', emailError);
      }
    }
    
    res.json({ 
      message: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.',
      debugToken: process.env.RESEND_API_KEY ? undefined : resetToken 
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la demande', error });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, password } = req.body;

  if (!password || password.length < 6) {
    return res.status(400).json({ message: 'Le mot de passe doit faire au moins 6 caractères' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { resetToken: token },
    });

    if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      return res.status(400).json({ message: 'Le lien est invalide ou a expiré' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    res.json({ message: 'Votre mot de passe a été réinitialisé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la réinitialisation', error });
  }
};
