import React, { useEffect, useState } from 'react';
import { accountingService } from '../services/accounting.service';
import styles from '../accounting.module.scss';
import { Search, Filter, Download, Printer } from 'lucide-react';
import { toast } from 'sonner';
import dayjs from 'dayjs';

export const GeneralLedgerPage: React.FC = () => {
  const [ledgers, setLedgers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await accountingService.getLedgerEntries();
      setLedgers(data?.data || data || []);
    } catch (error) {
      toast.error('Lỗi khi tải dữ liệu sổ cái');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.accountingContainer}>
      <div className={styles.header}>
        <h1>Sổ Cái (General Ledger)</h1>
        <div className={styles.actions}>
          <button className={styles.btnSecondary}><Printer size={16} /> In sổ</button>
          <button className={styles.btnSecondary}><Download size={16} /> Xuất Excel</button>
        </div>
      </div>
      
      <div className={styles.content}>
        <div className={styles.card}>
          <div className={styles.toolbar}>
            <div className={styles.searchBox}>
              <Search size={16} color="#888" />
              <input type="text" placeholder="Tìm kiếm chứng từ, diễn giải..." />
            </div>
            <button className={styles.btnSecondary}><Filter size={16} /> Bộ lọc</button>
          </div>
          
          <div className={styles.tableWrapper}>
            <table className={styles.dataGrid}>
              <thead>
                <tr>
                  <th>Ngày HT</th>
                  <th>Số CT</th>
                  <th>Ngày CT</th>
                  <th>Diễn giải</th>
                  <th>TK Nợ</th>
                  <th>TK Có</th>
                  <th>Số tiền</th>
                  <th>Đối tượng</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: '20px' }}>Đang tải dữ liệu...</td></tr>
                ) : ledgers.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: '20px' }}>Chưa có dữ liệu.</td></tr>
                ) : (
                  ledgers.map((entry, index) => (
                    <tr key={entry.id || index}>
                      <td>{entry.bookDate ? dayjs(entry.bookDate).format('DD/MM/YYYY') : '-'}</td>
                      <td style={{ color: 'var(--primary-600)', cursor: 'pointer', fontWeight: 500 }}>{entry.voucherNumber}</td>
                      <td>{entry.orginalBookDate ? dayjs(entry.orginalBookDate).format('DD/MM/YYYY') : '-'}</td>
                      <td>{entry.orginalDescription || entry.detail1}</td>
                      <td style={{ fontWeight: 500 }}>{entry.debitCode}</td>
                      <td style={{ fontWeight: 500 }}>{entry.creditCode}</td>
                      <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{entry.amount?.toLocaleString() || '0'}</td>
                      <td>{entry.orginalFullName || entry.orginalCompanyName}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralLedgerPage;
