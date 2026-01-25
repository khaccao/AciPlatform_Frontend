import React from 'react';
import { Users, UserCheck, UserMinus, TrendingUp } from 'lucide-react';
import styles from './DashboardPage.module.scss';

export const DashboardPage: React.FC = () => {
    const stats = [
        { label: 'Tổng nhân viên', value: '1,250', icon: <Users size={24} />, color: '#3FA9F5' },
        { label: 'Đang làm việc', value: '1,180', icon: <UserCheck size={24} />, color: '#22c55e' },
        { label: 'Nghỉ phép', value: '45', icon: <UserMinus size={24} />, color: '#f59e0b' },
        { label: 'Tỉ lệ tăng trưởng', value: '+12.5%', icon: <TrendingUp size={24} />, color: '#ef4444' },
    ];

    return (
        <div className={styles.dashboard}>
            <header className={styles.header}>
                <h1>Tổng quan hệ thống</h1>
                <p>Chào mừng bạn quay trở lại, đây là thống kê hôm nay.</p>
            </header>

            <div className={styles.statsGrid}>
                {stats.map((stat, index) => (
                    <div key={index} className={styles.statCard}>
                        <div className={styles.statIcon} style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                            {stat.icon}
                        </div>
                        <div className={styles.statInfo}>
                            <span className={styles.statLabel}>{stat.label}</span>
                            <span className={styles.statValue}>{stat.value}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.contentGrid}>
                <div className={styles.chartPlaceholder}>
                    <h3>Biểu đồ nhân sự</h3>
                    <div className={styles.dummyChart}>
                        {/* Chart would go here */}
                        <div className={styles.placeholderText}>Dữ liệu biểu đồ đang được tải...</div>
                    </div>
                </div>
                <div className={styles.recentActivity}>
                    <h3>Hoạt động gần đây</h3>
                    <div className={styles.activityList}>
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className={styles.activityItem}>
                                <div className={styles.activityAvatar}></div>
                                <div className={styles.activityText}>
                                    <strong>Nhân viên mới</strong> vừa được thêm vào phòng Kế toán.
                                    <span>2 giờ trước</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
