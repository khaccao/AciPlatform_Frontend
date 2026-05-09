import React, { useEffect, useState } from 'react';
import { accountingService } from '../services/accounting.service';
import styles from '../accounting.module.scss';
import { Search, Plus, Building2, Download, Edit, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

export const SupplierManagementPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState<any>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    taxCode: '',
    phone: '',
    email: '',
    address: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await accountingService.getSuppliers();
      setSuppliers(data?.data || data || []);
    } catch (error) {
      toast.error('Lỗi khi tải dữ liệu nhà cung cấp');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (supplier: any = null) => {
    if (supplier) {
      setCurrentSupplier(supplier);
      setFormData({
        name: supplier.name || '',
        code: supplier.code || '',
        taxCode: supplier.taxCode || '',
        phone: supplier.phone || '',
        email: supplier.email || '',
        address: supplier.address || ''
      });
    } else {
      setCurrentSupplier(null);
      setFormData({
        name: '',
        code: '',
        taxCode: '',
        phone: '',
        email: '',
        address: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentSupplier(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Vui lòng nhập tên nhà cung cấp');
      return;
    }

    try {
      setIsSubmitting(true);
      if (currentSupplier) {
        await accountingService.updateSupplier(currentSupplier.id, formData);
        toast.success('Cập nhật thành công');
      } else {
        await accountingService.createSupplier(formData);
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
    if (!window.confirm('Bạn có chắc chắn muốn xóa nhà cung cấp này?')) return;
    try {
      await accountingService.deleteSupplier(id);
      toast.success('Xóa thành công');
      fetchData();
    } catch (error) {
      toast.error('Có lỗi xảy ra khi xóa');
    }
  };

  return (
    <div className={styles.accountingContainer}>
      <div className={styles.header}>
        <h1>Danh Mục Nhà Cung Cấp</h1>
        <div className={styles.actions}>
          <button className={styles.btnSecondary}><Download size={16} /> Xuất Excel</button>
          <button className={styles.btnPrimary} onClick={() => handleOpenModal()}><Plus size={16} /> Thêm nhà cung cấp</button>
        </div>
      </div>
      
      <div className={styles.content}>
        <div className={styles.card}>
          <div className={styles.toolbar}>
            <div className={styles.searchBox}>
              <Search size={16} color="#888" />
              <input type="text" placeholder="Tìm kiếm theo mã, tên, MST..." />
            </div>
          </div>
          
          <div className={styles.tableWrapper}>
            <table className={styles.dataGrid}>
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>ID</th>
                  <th>Mã NCC</th>
                  <th>Tên nhà cung cấp</th>
                  <th>Mã số thuế</th>
                  <th>Địa chỉ</th>
                  <th>Số điện thoại</th>
                  <th>Email</th>
                  <th style={{ width: '100px', textAlign: 'center' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: '20px' }}>Đang tải dữ liệu...</td></tr>
                ) : suppliers.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: '20px' }}>Chưa có dữ liệu nhà cung cấp.</td></tr>
                ) : (
                  suppliers.map((sup, index) => (
                    <tr key={sup.id || index}>
                      <td>{sup.id}</td>
                      <td style={{ fontWeight: 500, color: 'var(--primary-600)' }}>{sup.code || '-'}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Building2 size={16} color="#888" />
                          <span style={{ fontWeight: 500 }}>{sup.name}</span>
                        </div>
                      </td>
                      <td>{sup.taxCode || '-'}</td>
                      <td>{sup.address || '-'}</td>
                      <td>{sup.phone || '-'}</td>
                      <td>{sup.email || '-'}</td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                          <button 
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-600)' }}
                            onClick={() => handleOpenModal(sup)}
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger-text)' }}
                            onClick={() => handleDelete(sup.id)}
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
              <h2>{currentSupplier ? 'Cập nhật nhà cung cấp' : 'Thêm nhà cung cấp mới'}</h2>
              <button onClick={handleCloseModal}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Mã nhà cung cấp</label>
                  <input 
                    type="text" 
                    name="code" 
                    value={formData.code} 
                    onChange={handleInputChange} 
                    placeholder="Để trống để tự động tạo" 
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Tên nhà cung cấp <span>*</span></label>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleInputChange} 
                    placeholder="Nhập tên nhà cung cấp" 
                    required 
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Mã số thuế</label>
                  <input 
                    type="text" 
                    name="taxCode" 
                    value={formData.taxCode} 
                    onChange={handleInputChange} 
                    placeholder="Nhập mã số thuế" 
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Số điện thoại</label>
                  <input 
                    type="text" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleInputChange} 
                    placeholder="Nhập số điện thoại" 
                  />
                </div>
                <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                  <label>Email</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleInputChange} 
                    placeholder="Nhập email" 
                  />
                </div>
                <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                  <label>Địa chỉ</label>
                  <input 
                    type="text" 
                    name="address" 
                    value={formData.address} 
                    onChange={handleInputChange} 
                    placeholder="Nhập địa chỉ" 
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

export default SupplierManagementPage;
