'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'gokartpartpicker_build';

export interface BuildItem {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  quantity: number;
}

interface BuildContextType {
  items: BuildItem[];
  addItem: (part: Omit<BuildItem, 'quantity'>) => void;
  removeItem: (partId: string) => void;
  clearBuild: () => void;
  totalPrice: number;
}

const BuildContext = createContext<BuildContextType | undefined>(undefined);

export function BuildProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<BuildItem[]>([]);
  const [isClient, setIsClient] = useState(false);

  // Initialize client-side and load from localStorage
  useEffect(() => {
    setIsClient(true);
    
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsedItems = JSON.parse(stored);
          setItems(Array.isArray(parsedItems) ? parsedItems : []);
        }
      } catch (error) {
        console.error('Failed to load build from localStorage:', error);
      }
    }
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    if (isClient && typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch (error) {
        console.error('Failed to save build to localStorage:', error);
      }
    }
  }, [items, isClient]);

  const addItem = useCallback((part: Omit<BuildItem, 'quantity'>) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === part.id);
      
      if (existingItem) {
        // Increment quantity if item already exists
        return prevItems.map((item) =>
          item.id === part.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Add new item with quantity = 1
        return [...prevItems, { ...part, quantity: 1 }];
      }
    });
  }, []);

  const removeItem = useCallback((partId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== partId));
  }, []);

  const clearBuild = useCallback(() => {
    setItems([]);
  }, []);

  const totalPrice = items.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);

  const value: BuildContextType = {
    items,
    addItem,
    removeItem,
    clearBuild,
    totalPrice,
  };

  return (
    <BuildContext.Provider value={value}>
      {children}
    </BuildContext.Provider>
  );
}

export function useBuild(): BuildContextType {
  const context = useContext(BuildContext);
  if (context === undefined) {
    throw new Error('useBuild must be used within a BuildProvider');
  }
  return context;
}

