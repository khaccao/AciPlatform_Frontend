import React, { forwardRef } from 'react';
import styles from './Input.module.scss';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, icon, className = '', ...props }, ref) => {
        return (
            <div className={`${styles.container} ${className}`}>
                {label && <label className={styles.label}>{label}</label>}
                <div className={`${styles.inputWrapper} ${error ? styles.hasError : ''}`}>
                    {icon && <span className={styles.icon}>{icon}</span>}
                    <input ref={ref} className={styles.input} {...props} />
                </div>
                {error && <span className={styles.errorText}>{error}</span>}
            </div>
        );
    }
);

Input.displayName = 'Input';
