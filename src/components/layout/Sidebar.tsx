'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, Files, Home, Settings } from 'lucide-react';
import clsx from 'clsx';
import styles from './Sidebar.module.css';

const navItems = [
    { href: '/', label: '首页', icon: Home },
    { href: '/tools/pdf-compress', label: 'PDF 压缩', icon: FileText },
    { href: '/tools/pdf-merge', label: 'PDF 合并', icon: Files },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logo}>
                <div className={styles.logoIcon}>JJ</div>
                <span className={styles.logoText}>Tools</span>
            </div>

            <nav className={styles.nav}>
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(styles.navItem, isActive && styles.active)}
                        >
                            <Icon size={20} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className={styles.footer}>
                <button className={styles.settingsBtn}>
                    <Settings size={20} />
                    <span>设置</span>
                </button>
            </div>
        </aside>
    );
}
