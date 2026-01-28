
import React, { forwardRef } from 'react';
import styles from './Select.module.scss';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: { label: string; value: string | number }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, error, options, className = '', ...props }, ref) => {
        return (
            <div className={`${styles.container} ${className}`}>
                {label && <label className={styles.label}>{label}</label>}
                <div className={`${styles.selectWrapper} ${error ? styles.hasError : ''}`}>
                    <select ref={ref} className={styles.select} {...props}>
                        {options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    <span className={styles.icon}>
                        <ChevronDown size={18} />
                    </span>
                </div>
                {error && <span className={styles.errorText}>{error}</span>}
            </div>
        );
    }
);

Select.displayName = 'Select';
