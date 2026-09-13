import { useState, useEffect } from 'react';
import { KLU_EMAIL_REGEX } from '../context/AuthContext';

export const useKluEmailValidation = (email: string) => {
  const [isValid, setIsValid] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setIsValid(false);
      setError(null); // Don't show error when empty
      return;
    }

    if (!KLU_EMAIL_REGEX.test(trimmedEmail)) {
      setIsValid(false);
      setError('Please use a valid @klu.ac.in email address.');
    } else {
      setIsValid(true);
      setError(null);
    }
  }, [email]);

  return { isValid, error };
};
