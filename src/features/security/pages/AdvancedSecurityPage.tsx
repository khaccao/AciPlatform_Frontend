import React, { useState, useEffect } from 'react';
import { Shield, ShieldCheck, ShieldAlert, Loader2, Search } from 'lucide-react';
import { Button } from '../../../shared/ui/Button/Button';
import { Input } from '../../../shared/ui/Input/Input';
import { securityService, type SecurityUser, type TwoFactorSetupResponse } from '../services/security.service';
import { toast } from 'sonner';
import styles from './AdvancedSecurityPage.module.scss';

export const AdvancedSecurityPage: React.FC = () => {
    const [users, setUsers] = useState<SecurityUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [setupData, setSetupData] = useState<TwoFactorSetupResponse | null>(null);
    const [verificationCode, setVerificationCode] = useState('');
    const [confirming, setConfirming] = useState(false);
    const [selectedUser, setSelectedUser] = useState<SecurityUser | null>(null);
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await securityService.getUsers();
            setUsers(data);
        } catch (error) {
            toast.error('Không thể tải danh sách bảo mật');
        } finally {
            setLoading(false);
        }
    };

    const handleEnable2FA = async (user: SecurityUser) => {
        try {
            setActionLoading(user.id);
            const response = await securityService.enable2FA(user.id);
            setSetupData(response);
            setSelectedUser(user);
            setVerificationCode('');
            toast.info(`Vui lòng quét mã QR để thiết lập 2FA cho ${user.username}`);
        } catch (error) {
            toast.error('Lỗi khi kích hoạt 2FA');
        } finally {
            setActionLoading(null);
        }
    };

    const handleConfirm2FA = async () => {
        if (!selectedUser || !verificationCode) {
            toast.error('Vui lòng nhập mã OTP');
            return;
        }

        try {
            setConfirming(true);
            await securityService.confirm2FA(selectedUser.id, verificationCode);
            toast.success(`Đã kích hoạt 2FA thành công cho ${selectedUser.username}`);
            setSetupData(null);
            loadUsers();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Mã OTP không hợp lệ');
        } finally {
            setConfirming(false);
        }
    };

    const handleDisable2FA = async (user: SecurityUser) => {
        if (!confirm(`Bạn có chắc muốn tắt 2FA cho tài khoản ${user.username}?`)) return;
        try {
            setActionLoading(user.id);
            await securityService.disable2FA(user.id);
            toast.success(`Đã tắt 2FA cho ${user.username}`);
            loadUsers();
        } catch (error) {
            toast.error('Lỗi khi tắt 2FA');
        } finally {
            setActionLoading(null);
        }
    };

    const handleViewSetup = async (user: SecurityUser) => {
        try {
            setActionLoading(user.id);
            const response = await securityService.getSetup2FA(user.id);
            setSetupData(response);
            setSelectedUser(user);
        } catch (error) {
            toast.error('Lỗi khi lấy thông tin 2FA');
        } finally {
            setActionLoading(null);
        }
    };

    const filteredUsers = users.filter(u => 
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1>Bảo mật nâng cao</h1>
                    <p>Quản lý xác thực 2 lớp (2FA) và bảo mật tài khoản hệ thống.</p>
                </div>
                <div className={styles.stats}>
                    <div className={styles.statCard}>
                        <ShieldCheck color="#10b981" size={20} />
                        <span>{users.filter(u => u.twoFactorEnabled).length} Đã bật 2FA</span>
                    </div>
                </div>
            </div>

            <div className={styles.toolbar}>
                <Input
                    placeholder="Tìm kiếm tài khoản..."
                    icon={<Search size={18} />}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.search}
                />
            </div>

            <div className={styles.tableCard}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Tài khoản</th>
                            <th>Họ và tên</th>
                            <th>Trạng thái 2FA</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={4} className={styles.empty}>
                                    <Loader2 className={styles.spinner} /> Đang tải...
                                </td>
                            </tr>
                        ) : filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={4} className={styles.empty}>Không tìm thấy tài khoản nào</td>
                            </tr>
                        ) : filteredUsers.map(user => (
                            <tr key={user.id}>
                                <td>
                                    <div className={styles.userInfo}>
                                        <span className={styles.username}>{user.username}</span>
                                        <span className={styles.email}>{user.email}</span>
                                    </div>
                                </td>
                                <td>{user.fullName}</td>
                                <td>
                                    {user.twoFactorEnabled ? (
                                        <span className={`${styles.badge} ${styles.badgeSuccess}`}>
                                            <ShieldCheck size={14} /> Đã bật
                                        </span>
                                    ) : user.hasSecret ? (
                                        <span className={`${styles.badge} ${styles.badgeWarning}`}>
                                            <ShieldAlert size={14} /> Chưa xác nhận
                                        </span>
                                    ) : (
                                        <span className={`${styles.badge} ${styles.badgeDisabled}`}>
                                            <Shield size={14} /> Chưa bật
                                        </span>
                                    )}
                                </td>
                                <td>
                                    <div className={styles.actions}>
                                        {user.twoFactorEnabled ? (
                                            <>
                                                <Button 
                                                    variant="secondary" 
                                                    size="sm"
                                                    onClick={() => handleViewSetup(user)}
                                                    disabled={actionLoading === user.id}
                                                >
                                                    Xem mã
                                                </Button>
                                                <Button 
                                                    variant="danger" 
                                                    size="sm"
                                                    onClick={() => handleDisable2FA(user)}
                                                    isLoading={actionLoading === user.id}
                                                >
                                                    Tắt 2FA
                                                </Button>
                                            </>
                                        ) : (
                                            <Button 
                                                variant="primary" 
                                                size="sm"
                                                onClick={() => handleEnable2FA(user)}
                                                isLoading={actionLoading === user.id}
                                            >
                                                Bật 2FA
                                            </Button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {setupData && selectedUser && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h2>Thiết lập 2FA cho {selectedUser.username}</h2>
                            <button onClick={() => { setSetupData(null); loadUsers(); }}>✕</button>
                        </div>
                        <div className={styles.modalContent}>
                            <div className={styles.qrSection}>
                                <img 
                                    src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(setupData.qrCodeImageUrl || '')}&size=200x200`} 
                                    alt="QR Code" 
                                />
                                <div className={styles.secretKey}>
                                    <p>Mã bí mật (Secret Key):</p>
                                    <code>{setupData.secretKey}</code>
                                </div>
                            </div>
                            <div className={styles.infoSection}>
                                <h3>Hướng dẫn</h3>
                                <ol>
                                    <li>Mở ứng dụng <strong>Google Authenticator</strong> trên điện thoại.</li>
                                    <li>Quét mã QR ở bên trái hoặc nhập mã bí mật theo cách thủ công.</li>
                                    <li>Nhập mã OTP 6 số vào ô bên dưới để xác nhận kích hoạt.</li>
                                </ol>

                                <div className={styles.verifyForm}>
                                    <Input
                                        placeholder="Nhập mã OTP 6 số"
                                        value={verificationCode}
                                        onChange={(e) => setVerificationCode(e.target.value)}
                                        maxLength={6}
                                        type="text"
                                    />
                                    <Button 
                                        onClick={handleConfirm2FA} 
                                        isLoading={confirming}
                                        disabled={verificationCode.length !== 6}
                                    >
                                        Xác nhận và Kích hoạt
                                    </Button>
                                </div>

                                {setupData.recoveryCodes && (
                                    <div className={styles.recoverySection}>
                                        <h3>Mã khôi phục (Recovery Codes)</h3>
                                        <p>Lưu lại các mã này để đăng nhập nếu mất quyền truy cập vào app Authenticator:</p>
                                        <div className={styles.codeGrid}>
                                            {setupData.recoveryCodes.map(code => (
                                                <code key={code}>{code}</code>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <Button onClick={() => { setSetupData(null); loadUsers(); }}>Hoàn tất</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
