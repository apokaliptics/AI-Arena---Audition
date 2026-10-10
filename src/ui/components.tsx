/**
 * Vietnamese Traditional Costume Studio - Design System Primitives
 * Bộ thành phần giao diện chuẩn phong cách Lạc Hồng (Đỏ Chu Sa, Hoàng Kim Đông Sơn, Nâu Sơn Mài),
 * Tất cả nút bấm bo tròn mềm mại (rounded-full / rounded-xl) theo yêu cầu thiết kế.
 */

import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  X,
  Info,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  LucideIcon
} from 'lucide-react';
import { TreeNodeItem } from '../constants/layout';

// --- BUTTON COMPONENT WITH ROUNDED EDGES ---
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gold';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  className = '',
  disabled,
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center font-bold tracking-wide transition-all duration-200 select-none cursor-pointer focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed rounded-full active:scale-95';

  const variants = {
    primary:
      'bg-gradient-to-r from-[#9e1b1b] via-[#bd2c2c] to-[#c83828] hover:from-[#b12222] hover:to-[#db4232] text-amber-50 shadow-[0_2px_12px_rgba(189,44,44,0.35)] border border-[#e05344]/40 rounded-full',
    gold:
      'bg-gradient-to-r from-[#c99846] via-[#ddaf5c] to-[#b88530] hover:from-[#deab4e] hover:to-[#ca9738] text-[#140d0c] font-black shadow-[0_2px_14px_rgba(201,152,70,0.35)] border border-[#f5d595]/60 rounded-full',
    secondary:
      'bg-[#221614] hover:bg-[#301e1c] active:bg-[#1a1110] text-[#f4ebd9] border border-[#d4a359]/25 hover:border-[#d4a359]/45 rounded-full',
    outline:
      'bg-transparent hover:bg-[#d4a359]/10 text-[#ebdcc9] border border-[#d4a359]/35 hover:border-[#d4a359]/65 active:bg-[#d4a359]/15 rounded-full',
    ghost:
      'bg-transparent hover:bg-white/[0.06] text-[#c7b5a3] hover:text-[#fdf6ec] rounded-full',
    danger:
      'bg-[#3d1313] hover:bg-[#521919] text-rose-200 border border-rose-800/40 rounded-full',
  };

  const sizes = {
    xs: 'text-[11px] px-2.5 py-1 gap-1',
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-6 py-2.5 gap-2.5',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />}
      {children}
      {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
    </button>
  );
};

// --- INPUT & CONTROLS ---
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => (
  <div className="flex flex-col gap-1 w-full">
    {label && <label className="text-xs font-semibold text-[#ebdcc9]">{label}</label>}
    <input
      className={`bg-[#18100f] border border-[#d4a359]/25 rounded-xl px-3.5 py-1.5 text-sm text-[#fdf6ec] placeholder:text-zinc-600 focus:outline-none focus:border-[#d4a359] focus:ring-1 focus:ring-[#d4a359]/40 transition-all ${
        error ? 'border-red-500' : ''
      } ${className}`}
      {...props}
    />
    {error && <span className="text-[11px] text-red-400">{error}</span>}
  </div>
);

// --- TAB COMPONENT WITH ROUNDED EDGES ---
export interface TabItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  badge?: string | number;
}

export const TabList: React.FC<{
  tabs: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}> = ({ tabs, activeId, onChange, className = '' }) => (
  <div className={`flex items-center gap-1 p-1 bg-[#160e0d] border border-[#d4a359]/20 rounded-full ${className}`}>
    {tabs.map((tab) => {
      const active = tab.id === activeId;
      const Icon = tab.icon;
      return (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-bold transition-all cursor-pointer ${
            active
              ? 'bg-gradient-to-r from-[#9e1b1b] to-[#c83828] text-amber-50 shadow-md border border-[#e05344]/40'
              : 'text-[#bfaea0] hover:text-[#fdf6ec] hover:bg-[#241615]'
          }`}
        >
          {Icon && <Icon className={`w-3.5 h-3.5 ${active ? 'text-[#f5cf89]' : ''}`} />}
          <span>{tab.label}</span>
          {tab.badge && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-red-600/40 text-red-200 font-mono">
              {tab.badge}
            </span>
          )}
        </button>
      );
    })}
  </div>
);

// --- ACCORDION COMPONENT ---
export const Accordion: React.FC<{
  title: string;
  defaultOpen?: boolean;
  icon?: LucideIcon;
  badge?: string;
  children: React.ReactNode;
  className?: string;
}> = ({ title, defaultOpen = true, icon: Icon, badge, children, className = '' }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`border border-[#d4a359]/20 rounded-2xl bg-[#1b1211] overflow-hidden ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 text-left bg-[#221614] hover:bg-[#2a1b19] transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-[#d4a359]" />}
          <span className="text-xs font-bold text-[#fdf6ec] tracking-wide">{title}</span>
          {badge && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#d4a359]/15 text-[#f5cf89] font-mono border border-[#d4a359]/25">
              {badge}
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-[#bfaea0] transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#fdf6ec]' : ''
          }`}
        />
      </button>
      {isOpen && <div className="p-3 text-xs text-[#ebdcc9]">{children}</div>}
    </div>
  );
};

// --- TREE NODE (CÂY CHỨC NĂNG) ---
export const TreeNode: React.FC<{
  node: TreeNodeItem;
  selectedId: string | null;
  onSelect: (id: string) => void;
  depth?: number;
}> = ({ node, selectedId, onSelect, depth = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const isSelected = selectedId === node.id;
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="flex flex-col select-none">
      <div
        onClick={() => onSelect(node.id)}
        style={{ paddingLeft: `${depth * 14 + 10}px` }}
        className={`flex items-center justify-between py-1.5 pr-2 rounded-full cursor-pointer transition-colors text-xs ${
          isSelected
            ? 'bg-[#d4a359]/20 text-[#f5cf89] font-bold border-l-2 border-[#d4a359]'
            : 'text-[#bfaea0] hover:text-[#fdf6ec] hover:bg-[#241615]'
        }`}
      >
        <div className="flex items-center gap-1.5 truncate">
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="p-0.5 text-zinc-400 hover:text-white rounded-full"
            >
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          ) : (
            <span className="w-3.5 h-3.5 inline-block text-amber-600/70 text-center">•</span>
          )}
          <span className="truncate">{node.label}</span>
        </div>
        {node.badge && (
          <span className="text-[10px] px-2 py-0.2 rounded-full bg-[#18100f] text-[#d4a359] border border-[#d4a359]/20">
            {node.badge}
          </span>
        )}
      </div>

      {hasChildren && isExpanded && (
        <div className="flex flex-col">
          {node.children!.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              selectedId={selectedId}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// --- TOOLTIP COMPONENT ---
export const Tooltip: React.FC<{
  content: string;
  children: React.ReactNode;
}> = ({ content, children }) => {
  return (
    <div className="relative group inline-flex">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:flex items-center px-2.5 py-1 rounded-full bg-[#1b1211] border border-[#d4a359]/30 text-[11px] text-[#fdf6ec] whitespace-nowrap shadow-xl z-50 pointer-events-none">
        {content}
      </div>
    </div>
  );
};

// --- TOAST COMPONENT ---
export const Toast: React.FC<{
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  onClose: () => void;
}> = ({ type, message, onClose }) => {
  const icons = {
    info: <Info className="w-4 h-4 text-blue-400" />,
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-400" />,
    error: <AlertCircle className="w-4 h-4 text-rose-400" />,
  };

  const borders = {
    info: 'border-blue-500/40',
    success: 'border-emerald-500/40',
    warning: 'border-[#d4a359]/50',
    error: 'border-rose-500/40',
  };

  return (
    <div
      className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-[#221614] border ${borders[type]} shadow-2xl text-xs text-[#fdf6ec] animate-fadeIn`}
    >
      {icons[type]}
      <span className="flex-1 font-semibold">{message}</span>
      <button onClick={onClose} className="text-zinc-400 hover:text-white cursor-pointer rounded-full p-1">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

// --- MODAL COMPONENT ---
export const Modal: React.FC<{
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  width?: string;
}> = ({ isOpen, title, onClose, children, width = 'max-w-xl' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div
        className={`w-full ${width} bg-[#1a1110] border border-[#d4a359]/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#d4a359]/20 bg-[#221614]">
          <h3 className="text-sm font-extrabold text-[#fdf6ec] tracking-wide">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};
