import React, { useEffect, useState } from 'react';
import { accountingService } from '../services/accounting.service';
import styles from '../accounting.module.scss';
import { Search, Plus, Download, Upload, Edit, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

export const ChartOfAccountsPage: React.FC = () => {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 1,
    openingDebit: 0,
    openingCredit: 0,
    isForeignCurrency: false
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await accountingService.getChartOfAccounts();
      setAccounts(data?.data || data || []);
    } catch (error) {
      toast.error('Lỗi khi tải hệ thống tài khoản');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (account: any = null) => {
    if (account) {
      setCurrentAccount(account);
      setFormData({
        code: account.code || '',
        name: account.name || '',
        type: account.type || 1,
        openingDebit: account.openingDebit || 0,
        openingCredit: account.openingCredit || 0,
        isForeignCurrency: account.isForeignCurrency || false
      });
    } else {
      setCurrentAccount(null);
      setFormData({
        code: '',
        name: '',
        type: 1,
        openingDebit: 0,
        openingCredit: 0,
        isForeignCurrency: false
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentAccount(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        [name]: name === 'type' || name === 'openingDebit' || name === 'openingCredit' 
          ? Number(value) 
          : value 
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.name) {
      toast.error('Vui lòng nhập số tài khoản và tên tài khoản');
      return;
    }

    try {
      setIsSubmitting(true);
      if (currentAccount) {
        await accountingService.updateChartOfAccount(currentAccount.id, formData);
        toast.success('Cập nhật thành công');
      } else {
        await accountingService.createChartOfAccount(formData);
        toast.success('Thêm mới thành công');
      }
      handleCloseModal();
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.msg || 'Có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tài khoản này?')) return;
    try {
      await accountingService.deleteChartOfAccount(id);
      toast.success('Xóa thành công');
      fetchData();
    } catch (error) {
      toast.error('Có lỗi xảy ra khi xóa');
    }
  };

  return (
    <div className={styles.accountingContainer}>
      <div className={styles.header}>
        <h1>Hệ Thống Tài Khoản Kế Toán</h1>
        <div className={styles.actions}>
          <button className={styles.btnSecondary}><Upload size={16} /> Nhập Excel</button>
          <button className={styles.btnSecondary}><Download size={16} /> Xuất Excel</button>
          <button className={styles.btnPrimary} onClick={() => handleOpenModal()}><Plus size={16} /> Thêm tài khoản</button>
        </div>
      </div>
      
      <div className={styles.content}>
        <div className={styles.card}>
          <div className={styles.toolbar}>
            <div className={styles.searchBox}>
              <Search size={16} color="#888" />
              <input type="text" placeholder="Tìm kiếm tài khoản..." />
            </div>
          </div>
          
          <div className={styles.tableWrapper}>
            <table className={styles.dataGrid}>
              <thead>
                <tr>
                  <th style={{ width: '120px' }}>Số TK</th>
                  <th>Tên tài khoản</th>
                  <th>Tính chất</th>
                  <th>Dư Nợ đầu kỳ</th>
                  <th>Dư Có đầu kỳ</th>
                  <th style={{ textAlign: 'center' }}>Có hạch toán NT</th>
                  <th style={{ width: '100px', textAlign: 'center' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>Đang tải dữ liệu...</td></tr>
                ) : accounts.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>Chưa có dữ liệu.</td></tr>
                ) : (
                  accounts.map((acc, index) => (
                    <tr key={acc.id || index} className={acc.hasChild ? styles.parentRow : ''}>
                      <td style={{ fontWeight: acc.hasChild ? 'bold' : 'normal', color: 'var(--primary-600)' }}>{acc.code}</td>
                      <td style={{ fontWeight: acc.hasChild ? 'bold' : 'normal' }}>{acc.name}</td>
                      <td>{acc.type === 1 ? 'Dư Nợ' : acc.type === 2 ? 'Dư Có' : 'Lưỡng tính'}</td>
                      <td style={{ textAlign: 'right' }}>{acc.openingDebit?.toLocaleString() || '-'}</td>
                      <td style={{ textAlign: 'right' }}>{acc.openingCredit?.toLocaleString() || '-'}</td>
                      <td style={{ textAlign: 'center' }}>{acc.isForeignCurrency ? 'Có' : 'Không'}</td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                          <button 
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-600)' }}
                            onClick={() => handleOpenModal(acc)}
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger-text)' }}
                            onClick={() => handleDelete(acc.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Add/Edit */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{currentAccount ? 'Cập nhật tài khoản' : 'Thêm tài khoản mới'}</h2>
              <button onClick={handleCloseModal}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Số tài khoản <span>*</span></label>
                  <input 
                    type="text" 
                    name="code" 
                    value={formData.code} 
                    onChange={handleInputChange} 
                    placeholder="Nhập số tài khoản" 
                    required 
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Tên tài khoản <span>*</span></label>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleInputChange} 
                    placeholder="Nhập tên tài khoản" 
                    required 
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Tính chất</label>
                  <select name="type" value={formData.type} onChange={handleInputChange}>
                    <option value={1}>Dư Nợ</option>
                    <option value={2}>Dư Có</option>
                    <option value={3}>Lưỡng tính</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '30px' }}>
                    <input 
                      type="checkbox" 
                      name="isForeignCurrency" 
                      checked={formData.isForeignCurrency} 
                      onChange={handleInputChange} 
                      style={{ width: '16px', height: '16px' }}
                    />
                    Có hạch toán ngoại tệ
                  </label>
                </div>
                <div className={styles.formGroup}>
                  <label>Dư Nợ đầu kỳ</label>
                  <input 
                    type="number" 
                    name="openingDebit" 
                    value={formData.openingDebit} 
                    onChange={handleInputChange} 
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Dư Có đầu kỳ</label>
                  <input 
                    type="number" 
                    name="openingCredit" 
                    value={formData.openingCredit} 
                    onChange={handleInputChange} 
                  />
                </div>
              </div>
              
              <div className={styles.formActions}>
                <button type="button" className={styles.btnCancel} onClick={handleCloseModal}>Hủy bỏ</button>
                <button type="submit" className={styles.btnSave} disabled={isSubmitting}>
                  {isSubmitting ? 'Đang lưu...' : 'Lưu lại'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartOfAccountsPage;
