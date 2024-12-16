import React from 'react';
import { AuthCard } from './AuthCard';
import { FormInput } from './FormInput';
import { Button } from '../ui/Button';
import { X } from 'lucide-react';
import { loginSchema } from '@/lib/validation';
import { useFormValidation } from '@/hooks/useFormValidation';
import type { AuthNavigationProps } from '@/types/auth';

interface LoginFormProps extends AuthNavigationProps {
  onClose: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onClose, onNavigate }) => {
  const { formData, errors, handleChange, handleSubmit } = useFormValidation({
    initialValues: { email: '', password: '' },
    validationSchema: loginSchema,
    onSubmit: (values) => {
      console.log('Form submitted:', values);
    }
  });

  return (
    <AuthCard
      title="Welcome back"
      description="Log in to your ReviewZone account"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormInput
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="john@company.com"
          error={errors.email}
          required
        />
        
        <div className="space-y-2">
          <FormInput
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            error={errors.password}
            required
          />
          <div className="text-right">
            <button
              type="button"
              onClick={() => onNavigate('forgot-password')}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Forgot password?
            </button>
          </div>
        </div>
        
        <Button type="submit" variant="primary" className="w-full">
          Log in
        </Button>
        
        <p className="text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={() => onNavigate('signup')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Sign up
          </button>
        </p>
      </form>
    </AuthCard>
  );
};