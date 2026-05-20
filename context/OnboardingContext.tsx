import React, { createContext, useContext, useState } from 'react';

type OnboardingData = {
  age: number | null;
  setAge: (age: number) => void;
  gender: string | null;
  setGender: (gender: string) => void;
  contactType: 'email' | 'phone' | null;
  setContactType: (type: 'email' | 'phone') => void;
  contact: string;
  setContact: (contact: string) => void;
};

const OnboardingContext = createContext<OnboardingData | undefined>(undefined);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [age, setAgeState] = useState<number | null>(null);
  const [gender, setGenderState] = useState<string | null>(null);
  const [contactType, setContactTypeState] = useState<'email' | 'phone' | null>('email');
  const [contact, setContactState] = useState('');

  const setAge = (age: number) => setAgeState(age);
  const setGender = (gender: string) => setGenderState(gender);
  const setContactType = (type: 'email' | 'phone') => setContactTypeState(type);
  const setContact = (contact: string) => setContactState(contact);

  return (
    <OnboardingContext.Provider
      value={{ age, setAge, gender, setGender, contactType, setContactType, contact, setContact }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) throw new Error('useOnboarding must be used within OnboardingProvider');
  return context;
}