import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User, Lock, LogIn, ChevronLeft } from 'lucide-react';
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
});

type UsernameFormValues = z.infer<typeof usernameSchema>;
type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // UI States
    const [step, setStep] = useState<'username' | 'password'>('username');
    const [companyCodes, setCompanyCodes] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    // Form for Step 1
    const usernameForm = useForm<UsernameFormValues>({
        resolver: zodResolver(usernameSchema),
    });

    // Form for Step 2
    const loginForm = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
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

    const onLogin = async (data: LoginFormValues) => {
        try {
            dispatch(loginStart());
            const response = await authService.login(data);

            if (response.status === 200 && response.data) {
                const { token, ...userData } = response.data;

                // Save dbName to localStorage for interceptor
                localStorage.setItem('dbName', data.companyCode);

                dispatch(loginSuccess({
                    user: {
                        id: userData.id,
                        username: userData.username,
                        fullName: userData.fullname,
                        avatar: userData.avatar,
                        roleName: userData.roleName || [],
                        menus: userData.menus || [],
                        companyCode: userData.companyCode
                    },
                    token
                }));
                toast.success('Đăng nhập thành công!');
                navigate('/dashboard');
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

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <div className={styles.logo}>
                        <LogIn size={32} color="#3FA9F5" />
                    </div>
                    <h1>ACI Platform</h1>
                    <p>{step === 'username' ? 'Nhập tên đăng nhập để bắt đầu' : `Chào mừng quay trở lại, ${loginForm.getValues('username')}`}</p>
                </div>

                {step === 'username' ? (
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
                ) : (
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
                            type="password"
                            placeholder="••••••••"
                            icon={<Lock size={18} />}
                            error={loginForm.formState.errors.password?.message}
                            {...loginForm.register('password')}
                            autoFocus
                        />

                        <div className={styles.options}>
                            <label className={styles.remember}>
                                <input type="checkbox" />
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

                <div className={styles.footer}>
                    <span>Hệ thống ERP All-In-One</span>
                </div>
            </div>
        </div>
    );
};
