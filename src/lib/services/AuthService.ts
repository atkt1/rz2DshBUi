import { supabase } from '@/lib/supabase';
import { TokenService } from './TokenService';
import { AuditService } from './AuditService';
import { AuthError, AUTH_ERROR_CODES } from '@/lib/utils/errors';
import { hashPassword } from '@/lib/utils/crypto';
import type { AuthResponse, UserSession } from '@/lib/types/auth';
import type { LoginInput, SignUpInput } from '@/lib/validation/auth';

export class AuthService {
  static async signUp({ email, password, firstName, lastName, deviceInfo }: SignUpInput): Promise<AuthResponse> {
    try {
      // Check if email already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUser) {
        throw new AuthError(
          'Email already exists',
          AUTH_ERROR_CODES.EMAIL_EXISTS
        );
      }

      // Hash password
      const passwordHash = await hashPassword(password);

      // Create user with default "Unpaid" plan
      const { data: userData, error: userError } = await supabase
        .rpc('create_user_with_plan', {
          p_email: email.toLowerCase(),
          p_firstname: firstName.trim(),
          p_lastname: lastName.trim(),
          p_password_hash: passwordHash,
          p_plan_name: 'Unpaid'
        });

      if (userError) {
        console.error('Create user error:', userError);
        throw new AuthError(
          'Failed to create user',
          AUTH_ERROR_CODES.SERVER_ERROR,
          { originalError: userError }
        );
      }

      if (!userData || userData.length === 0) {
        throw new AuthError(
          'User creation failed',
          AUTH_ERROR_CODES.SERVER_ERROR
        );
      }

      const user = userData[0];

      // Generate tokens
      const tokens = TokenService.generateTokens({
        userId: user.id,
        email: user.email,
        role: user.role || 'user',
        planId: user.plan_id
      }, deviceInfo);

      // Save refresh token
      const { error: tokenError } = await supabase
        .from('refresh_tokens')
        .insert({
          user_id: user.id,
          token: tokens.refreshToken,
          device_info: deviceInfo,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        });

      if (tokenError) {
        console.error('Save refresh token error:', tokenError);
      }

      // Log successful signup
      await AuditService.logAuthEvent('SIGNUP_SUCCESS', {
        userId: user.id,
        email: user.email
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstname,
          lastName: user.lastname,
          role: user.role || 'user',
          isVerified: false,
          planId: user.plan_id
        },
        tokens
      };
    } catch (error) {
      console.error('Signup error:', error);
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError(
        'Failed to create account',
        AUTH_ERROR_CODES.SERVER_ERROR,
        { originalError: error }
      );
    }
  }

  private static async saveRefreshToken(userId: number, token: string, deviceInfo?: string): Promise<void> {
    const { error } = await supabase
      .from('refresh_tokens')
      .insert({
        user_id: userId,
        token,
        device_info: deviceInfo,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      });

    if (error) {
      console.error('Failed to save refresh token:', error);
    }
  }
}