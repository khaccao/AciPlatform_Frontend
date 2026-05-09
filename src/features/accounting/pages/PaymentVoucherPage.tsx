import React from 'react';
import { PaymentVoucherForm } from '../components/PaymentVoucherForm';
import styles from '../accounting.module.scss';

export const PaymentVoucherPage: React.FC = () => {
  return (
    <div className={styles.accountingContainer}>
      <div className={styles.header}>
        <h1>Lập Phiếu Chi</h1>
      </div>
      <div className={styles.content}>
        <PaymentVoucherForm />
      </div>
    </div>
  );
};

export default PaymentVoucherPage;
