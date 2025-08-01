import React, { createContext, useContext, useState } from 'react';

interface AnimationContextType {
  widget1Animations: boolean; // Sections qui se déroulent verticalement (rotateX)
  setWidget1Animations: (enabled: boolean) => void;
  widget2Animations: boolean; // Icônes qui tournent (page catégories)
  setWidget2Animations: (enabled: boolean) => void;
  widget3Animations: boolean; // Sections qui tournent comme des moulins
  setWidget3Animations: (enabled: boolean) => void;
}

const AnimationContext = createContext<AnimationContextType | undefined>(undefined);

export const useAnimation = () => {
  const context = useContext(AnimationContext);
  if (!context) {
    throw new Error('useAnimation must be used within an AnimationProvider');
  }
  return context;
};

export const AnimationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [widget1Animations, setWidget1Animations] = useState(false);
  const [widget2Animations, setWidget2Animations] = useState(false);
  const [widget3Animations, setWidget3Animations] = useState(false);

  return (
    <AnimationContext.Provider value={{
      widget1Animations,
      setWidget1Animations,
      widget2Animations,
      setWidget2Animations,
      widget3Animations,
      setWidget3Animations,
    }}>
      {children}
    </AnimationContext.Provider>
  );
}; 