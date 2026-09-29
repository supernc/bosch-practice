import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  FileText,
  BookOpen,
  Shuffle,
  XCircle,
  Star,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Database,
  Wrench,
} from 'lucide-react';

const navItems = [
  { path: '/', label: '首页', icon: Home },
  { path: '/exam', label: '随机自测', icon: FileText },
  { path: '/practice', label: '领域练习', icon: BookOpen },
  { path: '/practical', label: '实操模拟题', icon: Wrench },
  { path: '/random', label: '随机练习', icon: Shuffle },
  { path: '/wrong', label: '错题本', icon: XCircle },
  { path: '/favorites', label: '收藏夹', icon: Star },
  { path: '/stats', label: '数据看板', icon: BarChart3 },
  { path: '/data', label: '数据管理', icon: Database },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-bg-secondary border-r border-white/5 transition-all duration-300 z-50 flex flex-col ${
        collapsed ? 'w-[68px]' : 'w-[240px]'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-white/5">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-primary-cyan flex items-center justify-center flex-shrink-0">
          <GraduationCap size={20} className="text-white" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <h1 className="text-sm font-bold text-text-primary">博世业务学习</h1>
            <p className="text-[10px] text-text-secondary">汽车业务方向刷题</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                isActive
                  ? 'bg-primary/15 text-primary-light border border-primary/20'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
              } ${collapsed ? 'justify-center' : ''}`
            }
          >
            <Icon size={20} className="flex-shrink-0 group-hover:scale-110 transition-transform" />
            {!collapsed && <span className="text-sm font-medium">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center h-12 border-t border-white/5 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>
    </aside>
  );
}
