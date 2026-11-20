'use client';

import React from 'react';
import {
  Palmtree, Waves, Compass, Banknote, Building2, CreditCard, Wallet, FileText,
  GraduationCap, ShoppingBag, Coffee, CalendarDays, Briefcase, CheckCircle2,
  Package, Clock, Wrench, AlertTriangle, AlertCircle, LayoutDashboard,
  ShoppingCart, Users, BarChart3, ListOrdered, Globe, Truck, Store,
  ClipboardList, Settings, Zap, Search, Menu, X, ChevronRight, ChevronDown,
  ChevronsUpDown, Check, Activity, Bell, LogOut, DollarSign, ArrowUpRight,
  ArrowDownRight, Sparkles, Star, User, Mail, Phone, Shield, Database,
  RefreshCw, Sun, Moon, Eye, Edit, Trash2, HelpCircle
} from 'lucide-react';

const ICON_REGISTRY = {
  Palmtree, Waves, Compass, Banknote, Building2, CreditCard, Wallet, FileText,
  GraduationCap, ShoppingBag, Coffee, CalendarDays, Briefcase, CheckCircle2,
  Package, Clock, Wrench, AlertTriangle, AlertCircle, LayoutDashboard,
  ShoppingCart, Users, BarChart3, ListOrdered, Globe, Truck, Store,
  ClipboardList, Settings, Zap, Search, Menu, X, ChevronRight, ChevronDown,
  ChevronsUpDown, Check, Activity, Bell, LogOut, DollarSign, ArrowUpRight,
  ArrowDownRight, Sparkles, Star, User, Mail, Phone, Shield, Database,
  RefreshCw, Sun, Moon, Eye, Edit, Trash2, HelpCircle
};

export default function LucideIcon({ name, size = 16, className = '', color, style = {}, strokeWidth = 1.8 }) {
  if (!name) return null;
  const Component = ICON_REGISTRY[name] || HelpCircle;
  return <Component size={size} className={className} color={color} style={style} strokeWidth={strokeWidth} />;
}

export { ICON_REGISTRY };
