import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User, Lock, LogIn, ChevronLeft, Eye, EyeOff } from 'lucide-react';
import { Input } from '../../../../shared/ui/Input/Input';
import { Button } from '../../../../shared/ui/Button/Button';
import { Select } from '../../../../shared/ui/Select/Select';
import styles from './LoginPage.module.scss';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../../store/auth.slice';
import { authService } from '../../services/auth.service';
import { toast } from 'sonner';

const usernameSchema = z.object({
    username: z.string().min(1, 'Tên đăng nhập không được để trống'),
});

const loginSchema = z.object({
    username: z.string().min(1, 'Tên đăng nhập không được để trống'),
    password: z.string().min(1, 'Mật khẩu không được để trống'),
    companyCode: z.string().min(1, 'Vui lòng chọn mã công ty'),
    rememberMe: z.boolean().optional(),
});

const otpSchema = z.object({
    code: z.string().length(6, 'Mã OTP phải có 6 chữ số'),
});

type UsernameFormValues = z.infer<typeof usernameSchema>;
type LoginFormValues = z.infer<typeof loginSchema>;
type OtpFormValues = z.infer<typeof otpSchema>;

export const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // UI States
    const [step, setStep] = useState<'username' | 'password' | 'otp'>('username');
    const [companyCodes, setCompanyCodes] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [userId, setUserId] = useState<number | null>(null);

    // Populate preserved username on mount
    useEffect(() => {
        const savedUsername = localStorage.getItem('preservedUsername');
        if (savedUsername) {
            usernameForm.setValue('username', savedUsername);
        }
    }, []);

    // Form for Step 1
    const usernameForm = useForm<UsernameFormValues>({
        resolver: zodResolver(usernameSchema),
    });

    // Form for Step 2
    const loginForm = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            rememberMe: localStorage.getItem('rememberMe') === 'true'
        }
    });

    // Form for Step 3 (2FA)
    const otpForm = useForm<OtpFormValues>({
        resolver: zodResolver(otpSchema),
    });

    const onCheckUsername = async (data: UsernameFormValues) => {
        try {
            setLoading(true);
            const response = await authService.checkUsername(data.username);

            if (response.companyCodes && response.companyCodes.length > 0) {
                setCompanyCodes(response.companyCodes);
                loginForm.setValue('username', data.username);
                loginForm.setValue('companyCode', response.companyCodes[0]); // Default to first
                setStep('password');
            } else {
                toast.error('Không tìm thấy thông tin tài khoản hoặc công ty phù hợp');
            }
        } catch (error: any) {
            const message = error.response?.data?.message || 'Tài khoản không tồn tại';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleLoginSuccess = (data: any, token: string, rememberMe: boolean, username: string, companyCode: string) => {
        // Save dbName to localStorage for interceptor
        localStorage.setItem('dbName', companyCode);

        // Handle remember me logic
        if (rememberMe) {
            localStorage.setItem('preservedUsername', username);
            localStorage.setItem('rememberMe', 'true');
        } else {
            localStorage.removeItem('preservedUsername');
            localStorage.setItem('rememberMe', 'false');
        }

        dispatch(loginSuccess({
            user: {
                id: data.id,
                username: data.username,
                fullName: data.fullname,
                avatar: data.avatar,
                roleName: data.roleName || [],
                menus: data.menus || [],
                companyCode: data.companyCode
            },
            token
        }));
        toast.success('Đăng nhập thành công!');
        navigate('/dashboard');
    };

    const onLogin = async (data: LoginFormValues) => {
        try {
            dispatch(loginStart());
            const response = await authService.login(data);

            if (response.status === 200 && response.data) {
                handleLoginSuccess(response.data, response.data.token, !!data.rememberMe, data.username, data.companyCode);
            } else if (response.status === 202 && response.data?.requires2FA) {
                // Requires 2FA
                setUserId(response.data.userId ?? null);
                setStep('otp');
                toast.info('Vui lòng nhập mã bảo mật (OTP) để tiếp tục');
            } else {
                dispatch(loginFailure(response.message || 'Sai mật khẩu hoặc thông tin xác thực'));
                toast.error(response.message || 'Sai mật khẩu hoặc thông tin xác thực');
            }
        } catch (error: any) {
            const message = error.response?.data?.message || 'Mật khẩu không đúng';
            dispatch(loginFailure(message));
            toast.error(message);
        }
    };

    const onVerify2FA = async (data: OtpFormValues) => {
        if (!userId) return;
        try {
            setLoading(true);
            const response = await authService.verify2FA({ userId, code: data.code });

            if (response.status === 200 && response.data) {
                const loginData = loginForm.getValues();
                handleLoginSuccess(response.data, response.data.token, !!loginData.rememberMe, loginData.username, loginData.companyCode);
            } else {
                toast.error(response.message || 'Mã OTP không chính xác');
            }
        } catch (error: any) {
            const message = error.response?.data?.message || 'Mã OTP không chính xác';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <div className={styles.logo}>
                        <LogIn size={32} color="#3FA9F5" />
                    </div>
                    <h1>ACI Platform</h1>
                    <p>
                        {step === 'username' && 'Nhập tên đăng nhập để bắt đầu'}
                        {step === 'password' && `Chào mừng quay trở lại, ${loginForm.getValues('username')}`}
                        {step === 'otp' && 'Xác minh bảo mật 2 lớp'}
                    </p>
                </div>

                {step === 'username' && (
                    <form className={styles.form} onSubmit={usernameForm.handleSubmit(onCheckUsername)}>
                        <Input
                            label="Tên đăng nhập"
                            placeholder="Nhập tên đăng nhập"
                            icon={<User size={18} />}
                            error={usernameForm.formState.errors.username?.message}
                            {...usernameForm.register('username')}
                        />

                        <Button type="submit" isLoading={loading} className={styles.submitBtn}>
                            Tiếp tục
                        </Button>
                    </form>
                )}

                {step === 'password' && (
                    <form className={styles.form} onSubmit={loginForm.handleSubmit(onLogin)}>
                        <button
                            type="button"
                            className={styles.backBtn}
                            onClick={() => setStep('username')}
                        >
                            <ChevronLeft size={16} /> Quay lại
                        </button>

                        <Select
                            label="Mã công ty"
                            options={companyCodes.map(c => ({ label: c, value: c }))}
                            error={loginForm.formState.errors.companyCode?.message}
                            {...loginForm.register('companyCode')}
                            disabled={companyCodes.length <= 1}
                        />

                        <Input
                            label="Mật khẩu"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            icon={<Lock size={18} />}
                            suffix={
                                <div onClick={() => setShowPassword(!showPassword)} style={{ cursor: 'pointer', display: 'flex' }}>
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </div>
                            }
                            error={loginForm.formState.errors.password?.message}
                            {...loginForm.register('password')}
                            autoFocus
                        />

                        <div className={styles.options}>
                            <label className={styles.remember}>
                                <input type="checkbox" {...loginForm.register('rememberMe')} />
                                <span>Ghi nhớ đăng nhập</span>
                            </label>
                            <Link to="/forgot-password" className={styles.forgot}>
                                Quên mật khẩu?
                            </Link>
                        </div>

                        <Button type="submit" isLoading={loginForm.formState.isSubmitting} className={styles.submitBtn}>
                            Đăng nhập
                        </Button>
                    </form>
                )}

                {step === 'otp' && (
                    <form className={styles.form} onSubmit={otpForm.handleSubmit(onVerify2FA)}>
                        <button
                            type="button"
                            className={styles.backBtn}
                            onClick={() => setStep('password')}
                        >
                            <ChevronLeft size={16} /> Quay lại
                        </button>

                        <div style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#666', fontSize: '0.9rem' }}>
                            Mở ứng dụng Google Authenticator và nhập mã 6 số được hiển thị cho tài khoản của bạn.
                        </div>

                        <Input
                            label="Mã xác thực (OTP)"
                            placeholder="000000"
                            error={otpForm.formState.errors.code?.message}
                            {...otpForm.register('code')}
                            autoFocus
                            maxLength={6}
                            style={{ textAlign: 'center', letterSpacing: '0.5em', fontSize: '1.2em' }}
                        />

                        <Button type="submit" isLoading={loading} className={styles.submitBtn}>
                            Xác nhận
                        </Button>
                    </form>
                )}

                <div className={styles.footer}>
                    <span>Hệ thống ERP All-In-One</span>
                </div>
            </div>
        </div>
    );
};
