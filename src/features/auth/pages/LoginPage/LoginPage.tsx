import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, Lock, LogIn } from 'lucide-react';
import { Input } from '../../../../shared/ui/Input/Input';
import { Button } from '../../../../shared/ui/Button/Button';
import styles from './LoginPage.module.scss';
import { Link } from 'react-router-dom';

const loginSchema = z.object({
    username: z.string().min(3, 'Tên đăng nhập ít nhất 3 ký tự'),
    password: z.string().min(6, 'Mật khẩu ít nhất 6 ký tự'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormValues) => {
        console.log('Login data:', data);
        // Logic to call API and dispatch to Redux
        await new Promise((resolve) => setTimeout(resolve, 1500));
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
