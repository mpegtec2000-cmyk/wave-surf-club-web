'use client';
import { createContext, useContext } from 'react';

export const BranchContext = createContext({
  activeBranchId: 1,
  setActiveBranchId: () => {}
});

export const useBranch = () => useContext(BranchContext);
