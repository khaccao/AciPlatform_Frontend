import React, { useEffect, useState, useCallback } from 'react';
import { 
  Plus, Edit2, Trash2, Search, 
  CheckCircle2, XCircle, X, Save
} from 'lucide-react';
import { toast } from 'sonner';
import styles from '../hotel.module.scss';
import hotelService from '../services/hotel.service';

interface ServiceItem {
  id: number;
  hotelCode: string;
  serviceCode: string;
  serviceName: string;
  category: string;
  unitPrice: number;
  unit: string;
  isAvailable: boolean;
}

const CATEGORIES = [
  { value: 'VEHICLE', label: 'Thuê xe' },
  { value: 'TOUR', label: 'Tour du lịch' },
  { value: 'FOOD', label: 'Ẩm thực' },
  { value: 'LAUNDRY', label: 'Giặt là' },
  { value: 'SPA', label: 'Spa & Wellness' },
  { value: 'OTHER', label: 'Dịch vụ khác' },
];

export const ServiceManagementPage: React.FC = () => {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const data = await hotelService.getServiceCatalog();
      setServices(data);
    } catch {
      toast.error('Lỗi tải danh mục dịch vụ');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await hotelService.upsertServiceCatalog(editingItem);
      toast.success('Đã lưu dịch vụ');
      setShowModal(false);
      fetchServices();
    } catch {
      toast.error('Lỗi lưu dịch vụ');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Xóa dịch vụ này?')) return;
    try {
      await hotelService.deleteServiceCatalog(id);
      toast.success('Đã xóa');
      fetchServices();
    } catch {
      toast.error('Lỗi xóa dịch vụ');
    }
  };

  const filtered = services.filter(s => {
    const matchesSearch = s.serviceName.toLowerCase().includes(search.toLowerCase()) || 
                         s.serviceCode.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !categoryFilter || s.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className={styles.hotelContainer}>
      <div className={styles.pageHeader}>
        <div>
          <h1>🛠️ Quản Lý Danh Mục Dịch Vụ</h1>
          <p style={{ color: '#64748b', fontSize: 13, margin: '4px 0 0' }}>Cấu hình dịch vụ, giá bán và đơn vị tính</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.btnPrimary} onClick={() => { setEditingItem({ id: 0, serviceCode: '', serviceName: '', category: 'OTHER', unitPrice: 0, unit: 'Lần', isAvailable: true }); setShowModal(true); }}>
            <Plus size={15} /> Thêm dịch vụ
          </button>
        </div>
      </div>

      <div className={styles.searchBar}>
        <div className={styles.searchInput}>
          <Search size={16} color="#94a3b8" />
          <input placeholder="Tìm tên hoặc mã dịch vụ..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className={styles.filterSelect} value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
          <option value="">Tất cả phân loại</option>
          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <button className={styles.btnSecondary} onClick={fetchServices}>Làm mới</button>
      </div>

      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}>Đang tải dữ liệu...</div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Mã DV</th>
                <th>Tên dịch vụ</th>
                <th>Phân loại</th>
                <th style={{ textAlign: 'right' }}>Đơn giá</th>
                <th>Đơn vị</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'center' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>Không tìm thấy dịch vụ nào</td></tr>
              ) : filtered.map(s => (
                <tr key={s.id}>
                  <td><span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#2563eb' }}>{s.serviceCode}</span></td>
                  <td><div style={{ fontWeight: 600 }}>{s.serviceName}</div></td>
                  <td>
                    <span className={`${styles.badge} ${styles.checkout}`}>
                      {CATEGORIES.find(c => c.value === s.category)?.label || s.category}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: '#1e6fff' }}>
                    {s.unitPrice.toLocaleString('vi-VN')}đ
                  </td>
                  <td>{s.unit}</td>
                  <td>
                    {s.isAvailable ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#16a34a', fontSize: 12, fontWeight: 600 }}>
                        <CheckCircle2 size={14} /> Đang bán
                      </span>
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#94a3b8', fontSize: 12, fontWeight: 600 }}>
                        <XCircle size={14} /> Ngừng bán
                      </span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
                      <button className={styles.btnIcon} onClick={() => { setEditingItem({...s}); setShowModal(true); }}><Edit2 size={15} /></button>
                      <button className={styles.btnIcon} style={{ color: '#ef4444' }} onClick={() => handleDelete(s.id)}><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent} style={{ width: 450 }}>
            <div className={styles.modalHeader}>
              <h3>{editingItem?.id ? 'Sửa dịch vụ' : 'Thêm dịch vụ mới'}</h3>
              <button onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} style={{ padding: 24 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className={styles.formGroup}>
                  <label>Mã dịch vụ *</label>
                  <input required disabled={!!editingItem?.id} value={editingItem?.serviceCode} onChange={e => setEditingItem({...editingItem, serviceCode: e.target.value.toUpperCase()})} placeholder="LAUNDRY_01" />
                </div>
                <div className={styles.formGroup}>
                  <label>Phân loại *</label>
                  <select value={editingItem?.category} onChange={e => setEditingItem({...editingItem, category: e.target.value})}>
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Tên dịch vụ *</label>
                <input required value={editingItem?.serviceName} onChange={e => setEditingItem({...editingItem, serviceName: e.target.value})} placeholder="Giặt quần áo sơ mi..." />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className={styles.formGroup}>
                  <label>Đơn giá (VND) *</label>
                  <input type="number" required value={editingItem?.unitPrice} onChange={e => setEditingItem({...editingItem, unitPrice: Number(e.target.value)})} />
                </div>
                <div className={styles.formGroup}>
                  <label>Đơn vị tính</label>
                  <input value={editingItem?.unit} onChange={e => setEditingItem({...editingItem, unit: e.target.value})} placeholder="Lần, Cái, Kg..." />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={editingItem?.isAvailable} onChange={e => setEditingItem({...editingItem, isAvailable: e.target.checked})} />
                  Đang cung cấp dịch vụ này
                </label>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button type="button" className={styles.btnSecondary} style={{ flex: 1 }} onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className={styles.btnPrimary} style={{ flex: 1, gap: 8 }}><Save size={16} /> Lưu thông tin</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
