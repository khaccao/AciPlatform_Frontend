
import React, { useState, useEffect } from 'react';
import {
    Palette,
    Moon,
    Sun,
    Monitor,
    Check,
    Save,
    RefreshCcw,
    Shield,
    Bell,
    User
} from 'lucide-react';
import { Button } from '../../../../shared/components/Button/Button';
import styles from './SettingsPage.module.scss';
import { toast } from 'sonner';

const PRESET_COLORS = [
    { name: 'ACI Blue', value: '#3FA9F5' },
    { name: 'Emerald', value: '#10b981' },
    { name: 'Violet', value: '#8b5cf6' },
    { name: 'Rose', value: '#f43f5e' },
    { name: 'Amber', value: '#f59e0b' },
    { name: 'Slate', value: '#64748b' },
];

import { useAppSelector } from '../../../../app/hooks';

export const SettingsPage: React.FC = () => {
    const user = useAppSelector(state => state.auth.user);
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [primaryColor, setPrimaryColor] = useState('#3FA9F5');
    const [activeTab, setActiveTab] = useState<'appearance' | 'account' | 'notifications' | 'security'>('appearance');

    const storageKeyTheme = user ? `theme_${user.username}` : 'theme';
    const storageKeyColor = user ? `primaryColor_${user.username}` : 'primaryColor';

    useEffect(() => {
        const savedTheme = localStorage.getItem(storageKeyTheme) as 'light' | 'dark' || 'light';
        const savedColor = localStorage.getItem(storageKeyColor) || '#3FA9F5';
        setTheme(savedTheme);
        setPrimaryColor(savedColor);
        applyTheme(savedTheme, savedColor);
    }, [storageKeyTheme, storageKeyColor]);

    const applyTheme = (mode: 'light' | 'dark', color: string) => {
        document.documentElement.setAttribute('data-theme', mode);
        document.documentElement.style.setProperty('--primary-color', color);
        document.documentElement.style.setProperty('--primary-light', `${color}15`);
    };

    const handleSave = () => {
        localStorage.setItem(storageKeyTheme, theme);
        localStorage.setItem(storageKeyColor, primaryColor);
        applyTheme(theme, primaryColor);
        toast.success('Cấu hình đã được lưu thành công cho tài khoản của bạn!');
    };

    const handleReset = () => {
        setTheme('light');
        setPrimaryColor('#3FA9F5');
        applyTheme('light', '#3FA9F5');
        toast.info('Đã khôi phục cài đặt mặc định');
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.titleArea}>
                    <h1>Cài đặt hệ thống</h1>
                    <p>Tùy chỉnh giao diện và cấu hình tài khoản cá nhân</p>
                </div>
                <div className={styles.headerActions}>
                    <Button variant="ghost" icon={<RefreshCcw size={18} />} onClick={handleReset}>Khôi phục</Button>
                    <Button variant="primary" icon={<Save size={18} />} onClick={handleSave}>Lưu thay đổi</Button>
                </div>
            </header>

            <div className={styles.layout}>
                <aside className={styles.sidebar}>
                    <nav className={styles.nav}>
                        <button
                            className={`${styles.navItem} ${activeTab === 'appearance' ? styles.active : ''}`}
                            onClick={() => setActiveTab('appearance')}
                        >
                            <Palette size={20} />
                            <span>Giao diện</span>
                        </button>
                        <button
                            className={`${styles.navItem} ${activeTab === 'account' ? styles.active : ''}`}
                            onClick={() => setActiveTab('account')}
                        >
                            <User size={20} />
                            <span>Tài khoản</span>
                        </button>
                        <button
                            className={`${styles.navItem} ${activeTab === 'notifications' ? styles.active : ''}`}
                            onClick={() => setActiveTab('notifications')}
                        >
                            <Bell size={20} />
                            <span>Thông báo</span>
                        </button>
                        <button
                            className={`${styles.navItem} ${activeTab === 'security' ? styles.active : ''}`}
                            onClick={() => setActiveTab('security')}
                        >
                            <Shield size={20} />
                            <span>Bảo mật</span>
                        </button>
                    </nav>
                </aside>

                <main className={styles.main}>
                    {activeTab === 'appearance' && (
                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <h3>Chế độ hiển thị</h3>
                                <p>Chọn giao diện phù hợp với môi trường làm việc của bạn</p>
                            </div>

                            <div className={styles.themeGrid}>
                                <div
                                    className={`${styles.themeCard} ${theme === 'light' ? styles.selected : ''}`}
                                    onClick={() => setTheme('light')}
                                >
                                    <div className={styles.themePreview} style={{ backgroundColor: '#f9fafb' }}>
                                        <div className={styles.previewSidebar}></div>
                                        <div className={styles.previewContent}>
                                            <div className={styles.previewBar}></div>
                                            <div className={styles.previewBox}></div>
                                        </div>
                                    </div>
                                    <div className={styles.themeInfo}>
                                        <Sun size={16} />
                                        <span>Sáng</span>
                                        {theme === 'light' && <Check size={16} className={styles.check} />}
                                    </div>
                                </div>

                                <div
                                    className={`${styles.themeCard} ${theme === 'dark' ? styles.selected : ''}`}
                                    onClick={() => setTheme('dark')}
                                >
                                    <div className={styles.themePreview} style={{ backgroundColor: '#111827' }}>
                                        <div className={styles.previewSidebar} style={{ backgroundColor: '#1f2937' }}></div>
                                        <div className={styles.previewContent}>
                                            <div className={styles.previewBar} style={{ backgroundColor: '#374151' }}></div>
                                            <div className={styles.previewBox} style={{ backgroundColor: '#374151' }}></div>
                                        </div>
                                    </div>
                                    <div className={styles.themeInfo}>
                                        <Moon size={16} />
                                        <span>Tối</span>
                                        {theme === 'dark' && <Check size={16} className={styles.check} />}
                                    </div>
                                </div>
                            </div>

                            <div className={styles.divider}></div>

                            <div className={styles.sectionHeader}>
                                <h3>Màu sắc thương hiệu</h3>
                                <p>Tùy chọn màu sắc chủ đạo cho ứng dụng của bạn</p>
                            </div>

                            <div className={styles.colorGrid}>
                                {PRESET_COLORS.map((color) => (
                                    <div
                                        key={color.value}
                                        className={`${styles.colorItem} ${primaryColor === color.value ? styles.active : ''}`}
                                        onClick={() => setPrimaryColor(color.value)}
                                        style={{ '--color': color.value } as any}
                                        title={color.name}
                                    >
                                        {primaryColor === color.value && <Check size={20} />}
                                    </div>
                                ))}
                                <div className={styles.customColor}>
                                    <input
                                        type="color"
                                        value={primaryColor}
                                        onChange={(e) => setPrimaryColor(e.target.value)}
                                    />
                                    <span>Tùy chỉnh</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab !== 'appearance' && (
                        <div className={styles.emptyContent}>
                            <Monitor size={48} />
                            <h3>Tính năng đang phát triển</h3>
                            <p>Chúng tôi đang nỗ lực để hoàn thiện các module quản lý cá nhân này.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};
