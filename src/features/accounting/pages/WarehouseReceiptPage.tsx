import React from 'react';
import { WarehouseReceiptForm } from '../components/WarehouseReceiptForm';
import styles from '../accounting.module.scss';

export const WarehouseReceiptPage: React.FC = () => {
  return (
    <div className={styles.accountingContainer}>
      <div className={styles.header}>
        <h1>Lập Phiếu Nhập Kho</h1>
      </div>
      <div className={styles.content}>
        <WarehouseReceiptForm />
      </div>
    </div>
  );
};

export default WarehouseReceiptPage;
