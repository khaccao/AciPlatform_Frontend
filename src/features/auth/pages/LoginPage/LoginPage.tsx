import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, Lock, LogIn } from 'lucide-react';
import { Input } from '../../../../shared/ui/Input/Input';
import { Button } from '../../../../shared/ui/Button/Button';
import styles from './LoginPage.module.scss';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../../store/auth.slice';
import { authService } from '../../services/auth.service';
import { toast } from 'sonner';

const loginSchema = z.object({
    username: z.string().min(1, 'Tên đăng nhập không được để trống'),
    password: z.string().min(1, 'Mật khẩu không được để trống'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormValues) => {
        try {
            dispatch(loginStart());
            const response = await authService.login(data);

            if (response.status === 200 && response.data) {
                const { token, ...userData } = response.data;
                dispatch(loginSuccess({
                    user: {
                        id: userData.id.toString(),
                        username: userData.username,
                        fullName: userData.fullname,
                        email: userData.email || '',
                        role: userData.roleName?.[0] || 'User'
                    },
                    token
                }));
                toast.success('Đăng nhập thành công!');
                navigate('/dashboard');
            } else {
                dispatch(loginFailure(response.message || 'Sai tên đăng nhập hoặc mật khẩu'));
                toast.error(response.message || 'Sai tên đăng nhập hoặc mật khẩu');
            }
        } catch (error: any) {
            const message = error.response?.data?.message || 'Có lỗi xảy ra khi đăng nhập';
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
                    <h1>Chào mừng trở lại</h1>
                    <p>Đăng nhập để quản lý nhân sự của bạn</p>
                </div>

                <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
                    <Input
                        label="Tên đăng nhập"
                        placeholder="Nhập tên đăng nhập"
                        icon={<Mail size={18} />}
                        error={errors.username?.message}
                        {...register('username')}
                    />

                    <Input
                        label="Mật khẩu"
                        type="password"
                        placeholder="••••••••"
                        icon={<Lock size={18} />}
                        error={errors.password?.message}
                        {...register('password')}
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

                    <Button type="submit" isLoading={isSubmitting} className={styles.submitBtn}>
                        Đăng nhập
                    </Button>
                </form>

                <div className={styles.footer}>
                    <span>Chưa có tài khoản?</span>
                    <Link to="/register">Đăng ký ngay</Link>
                </div>
            </div>
        </div>
    );
};
