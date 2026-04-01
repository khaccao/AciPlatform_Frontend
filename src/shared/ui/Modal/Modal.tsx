
import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import styles from './Modal.module.scss';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    footer,
    size = 'md'
}) => {
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleEsc);
        }
        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleEsc);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div
                className={`${styles.modal} ${styles[size]}`}
                onClick={e => e.stopPropagation()}
            >
                <header className={styles.header}>
                    <h2>{title}</h2>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <X size={20} />
                    </button>
                </header>
                <div className={styles.content}>
                    {children}
                </div>
                {footer && (
                    <footer className={styles.footer}>
                        {footer}
                    </footer>
                )}
            </div>
        </div>
    );
};
