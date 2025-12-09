'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ChainSize } from '@/mock/parts';

const STORAGE_KEY = 'gokartpartpicker_build_config';

export type UsageType = "KID_KART" | "YARD_KART" | "OFF_ROAD" | "DRIFT" | "RACING";

export interface BuildConfig {
  engineModel: string;        // e.g. "Predator 212"
  shaftSize: string;          // e.g. '3/4"' or '1"'
  chainSize: ChainSize;       // e.g. "#35"
  usageType: UsageType;
}

interface BuildConfigContextType {
  config: BuildConfig;
  setConfig: (config: BuildConfig) => void;
  updateConfig: (partial: Partial<BuildConfig>) => void;
}

const BuildConfigContext = createContext<BuildConfigContextType | undefined>(undefined);

// Default configuration
const DEFAULT_CONFIG: BuildConfig = {
  engineModel: "Predator 212",
  shaftSize: '3/4"',
  chainSize: "#35",
  usageType: "YARD_KART",
};

export function BuildConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfigState] = useState<BuildConfig>(DEFAULT_CONFIG);
  const [isClient, setIsClient] = useState(false);

  // Initialize client-side and load from localStorage
  useEffect(() => {
    setIsClient(true);
    
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsedConfig = JSON.parse(stored);
          // Validate and merge with defaults
          setConfigState({
            engineModel: parsedConfig.engineModel || DEFAULT_CONFIG.engineModel,
            shaftSize: parsedConfig.shaftSize || DEFAULT_CONFIG.shaftSize,
            chainSize: parsedConfig.chainSize || DEFAULT_CONFIG.chainSize,
            usageType: parsedConfig.usageType || DEFAULT_CONFIG.usageType,
          });
        }
      } catch (error) {
        console.error('Failed to load build config from localStorage:', error);
        // Use defaults if parsing fails
        setConfigState(DEFAULT_CONFIG);
      }
    }
  }, []);

  // Save to localStorage whenever config changes
  useEffect(() => {
    if (isClient && typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      } catch (error) {
        console.error('Failed to save build config to localStorage:', error);
      }
    }
  }, [config, isClient]);

  const setConfig = useCallback((newConfig: BuildConfig) => {
    setConfigState(newConfig);
  }, []);

  const updateConfig = useCallback((partial: Partial<BuildConfig>) => {
    setConfigState((prevConfig) => ({
      ...prevConfig,
      ...partial,
    }));
  }, []);

  const value: BuildConfigContextType = {
    config,
    setConfig,
    updateConfig,
  };

  return (
    <BuildConfigContext.Provider value={value}>
      {children}
    </BuildConfigContext.Provider>
  );
}

export function useBuildConfig(): BuildConfigContextType {
  const context = useContext(BuildContextContext);
  if (context === undefined) {
    throw new Error('useBuildConfig must be used within a BuildConfigProvider');
  }
  return context;
}

