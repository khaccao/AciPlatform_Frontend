import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User, Mail, Lock, UserPlus } from 'lucide-react';
import { Input } from '../../../../shared/ui/Input/Input';
import { Button } from '../../../../shared/ui/Button/Button';
import styles from './RegisterPage.module.scss';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { toast } from 'sonner';

const registerSchema = z.object({
    fullName: z.string().min(2, 'Họ tên ít nhất 2 ký tự'),
    username: z.string().min(3, 'Tên đăng nhập ít nhất 3 ký tự'),
    email: z.string().email('Email không hợp lệ'),
    password: z.string().min(6, 'Mật khẩu ít nhất 6 ký tự'),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterFormValues) => {
        try {
            await authService.register(data);
            toast.success('Đăng ký thành công! Hãy đăng nhập.');
            navigate('/login');
        } catch (error: any) {
            const message = error.response?.data?.message || 'Có lỗi xảy ra khi đăng ký';
            toast.error(message);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <div className={styles.logo}>
                        <UserPlus size={32} color="#3FA9F5" />
                    </div>
                    <h1>Tạo tài khoản</h1>
                    <p>Bắt đầu quản lý nhân sự hiệu quả ngay hôm nay</p>
                </div>

                <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
                    <Input
                        label="Họ và tên"
                        placeholder="Nguyễn Văn A"
                        icon={<User size={18} />}
                        error={errors.fullName?.message}
                        {...register('fullName')}
                    />

                    <Input
                        label="Tên đăng nhập"
                        placeholder="user123"
                        icon={<User size={18} />}
                        error={errors.username?.message}
                        {...register('username')}
                    />

                    <Input
                        label="Email"
                        type="email"
                        placeholder="example@gmail.com"
                        icon={<Mail size={18} />}
                        error={errors.email?.message}
                        {...register('email')}
                    />

                    <Input
                        label="Mật khẩu"
                        type="password"
                        placeholder="••••••••"
                        icon={<Lock size={18} />}
                        error={errors.password?.message}
                        {...register('password')}
                    />

                    <Input
                        label="Xác nhận mật khẩu"
                        type="password"
                        placeholder="••••••••"
                        icon={<Lock size={18} />}
                        error={errors.confirmPassword?.message}
                        {...register('confirmPassword')}
                    />

                    <Button type="submit" isLoading={isSubmitting} className={styles.submitBtn}>
                        Đăng ký
                    </Button>
                </form>

                <div className={styles.footer}>
                    <span>Đã có tài khoản?</span>
                    <Link to="/login">Đăng nhập</Link>
                </div>
            </div>
        </div>
    );
};
