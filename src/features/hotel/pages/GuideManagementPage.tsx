import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, FileText, DollarSign, Search, Filter, 
  Edit2, Trash2, CheckCircle, XCircle, ExternalLink,
  Phone, Mail, Clock, Briefcase
} from 'lucide-react';
import { toast } from 'sonner';
import styles from '../hotel.module.scss';
import hotelService from '../services/hotel.service';
import type { HotelTourGuideDto, GuideContractDto, GuideSalaryDto } from '../services/hotel.types';
import { Link } from 'react-router-dom';

type ActiveTab = 'guides' | 'contracts' | 'payroll';

export const GuideManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('guides');
  const [loading, setLoading] = useState(true);
  const [guides, setGuides] = useState<HotelTourGuideDto[]>([]);
  const [contracts, setContracts] = useState<GuideContractDto[]>([]);
  const [salaries, setSalaries] = useState<GuideSalaryDto[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [, setShowContractModal] = useState(false);
  const [, setShowSalaryModal] = useState(false);
  const [editingGuide, setEditingGuide] = useState<Partial<HotelTourGuideDto> | null>(null);
  
  // Form State
  const [guideForm, setGuideForm] = useState<Partial<HotelTourGuideDto>>({});

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  useEffect(() => {
    if (editingGuide) {
      setGuideForm(editingGuide);
    } else {
      setGuideForm({
        isFreelance: true,
        isActive: true,
        contractType: 'FREELANCE',
        dailyRate: 0
      });
    }
  }, [editingGuide, showGuideModal]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'guides') {
        const data = await hotelService.getGuides();
        setGuides(data);
      } else if (activeTab === 'contracts') {
        const data = await hotelService.getGuideContracts();
        setContracts(data);
      } else if (activeTab === 'payroll') {
        const now = new Date();
        const data = await hotelService.getGuideSalaries(now.getMonth() + 1, now.getFullYear());
        setSalaries(data);
      }
    } catch (error) {
      toast.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGuide = async () => {
    if (!guideForm.name) {
      toast.error('Vui lòng nhập tên hướng dẫn viên');
      return;
    }
    try {
      await hotelService.upsertGuide(guideForm);
      toast.success('Đã lưu thông tin hướng dẫn viên');
      setShowGuideModal(false);
      fetchData();
    } catch (error) {
      toast.error('Lỗi khi lưu thông tin');
    }
  };

  const handleToggleStatus = async (guide: HotelTourGuideDto) => {
    try {
      await hotelService.toggleGuideStatus(guide.id, !guide.isActive);
      toast.success(`${guide.isActive ? 'Tạm dừng' : 'Kích hoạt'} thành công`);
      fetchData();
    } catch (error) {
      toast.error('Thao tác thất bại');
    }
  };

  const handleDeleteGuide = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa hướng dẫn viên này?')) return;
    try {
      await hotelService.deleteGuide(id);
      toast.success('Đã xóa hướng dẫn viên');
      fetchData();
    } catch (error) {
      toast.error('Lỗi khi xóa');
    }
  };

  const handleApproveSalary = async (id: number) => {
    try {
      await hotelService.approveGuideSalary(id);
      toast.success('Đã duyệt bảng lương');
      fetchData();
    } catch (error) {
      toast.error('Lỗi khi duyệt');
    }
  };

  const handleMarkPaid = async (id: number) => {
    try {
      await hotelService.markGuideSalaryPaid(id);
      toast.success('Xác nhận đã chi trả thành công');
      fetchData();
    } catch (error) {
      toast.error('Thao tác thất bại');
    }
  };

  const filteredGuides = guides.filter(g => 
    g.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    g.guideCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.phone?.includes(searchQuery)
  );

  return (
    <div className={styles.hotelContainer}>
      <div className={styles.pageHeader}>
        <div>
          <h1>👷 Quản Lý Hướng Dẫn Viên</h1>
          <p style={{ color: '#64748b', fontSize: 13, margin: '4px 0 0' }}>Quản lý nhân sự, hợp đồng và lương HDV du lịch</p>
        </div>
        <div className={styles.headerActions}>
          <Link to="/hr/contracts" className={styles.btnSecondary} style={{ textDecoration: 'none' }}>
            <ExternalLink size={15} /> Link HR Module
          </Link>
          {activeTab === 'guides' && (
            <button className={styles.btnPrimary} onClick={() => { setEditingGuide(null); setShowGuideModal(true); }}>
              <UserPlus size={15} /> Thêm HDV
            </button>
          )}
          {activeTab === 'contracts' && (
            <button className={styles.btnPrimary} onClick={() => setShowContractModal(true)}>
              <FileText size={15} /> Ký hợp đồng
            </button>
          )}
          {activeTab === 'payroll' && (
            <button className={styles.btnPrimary} onClick={() => setShowSalaryModal(true)}>
              <DollarSign size={15} /> Tính lương tháng
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIcon} ${styles.blue}`}><Users size={20} /></div>
          <span className={styles.kpiLabel}>Tổng HDV</span>
          <span className={styles.kpiValue}>{guides.length}</span>
          <span className={styles.kpiSub}>{guides.filter(g => g.isActive).length} đang hoạt động</span>
        </div>
        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIcon} ${styles.green}`}><Briefcase size={20} /></div>
          <span className={styles.kpiLabel}>Hợp đồng Active</span>
          <span className={styles.kpiValue}>{contracts.filter(c => c.status === 'ACTIVE').length}</span>
          <span className={styles.kpiSub}>Trên tổng {contracts.length} hợp đồng</span>
        </div>
        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIcon} ${styles.orange}`}><Clock size={20} /></div>
          <span className={styles.kpiLabel}>Lương chờ duyệt</span>
          <span className={styles.kpiValue}>{salaries.filter(s => s.status === 'PENDING').length}</span>
          <span className={styles.kpiSub}>Tháng {new Date().getMonth() + 1}/{new Date().getFullYear()}</span>
        </div>
        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIcon} ${styles.purple}`}><DollarSign size={20} /></div>
          <span className={styles.kpiLabel}>Tổng chi trả</span>
          <span className={styles.kpiValue}>
            {salaries.reduce((acc, s) => acc + (s.status === 'PAID' ? s.totalPay : 0), 0).toLocaleString()}đ
          </span>
          <span className={styles.kpiSub}>Lương đã thanh toán tháng này</span>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'guides' ? styles.active : ''}`}
          onClick={() => setActiveTab('guides')}
        >
          <Users size={16} /> Danh sách HDV
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'contracts' ? styles.active : ''}`}
          onClick={() => setActiveTab('contracts')}
        >
          <FileText size={16} /> Hợp đồng lao động
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'payroll' ? styles.active : ''}`}
          onClick={() => setActiveTab('payroll')}
        >
          <DollarSign size={16} /> Bảng lương HDV
        </button>
      </div>

      {/* Search & Filter */}
      <div className={styles.searchBar}>
        <div className={styles.searchInput}>
          <Search size={16} color="#94a3b8" />
          <input 
            placeholder="Tìm theo tên, mã HDV hoặc SĐT..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select className={styles.filterSelect}>
          <option value="">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Tạm dừng</option>
        </select>
        <button className={styles.btnSecondary}><Filter size={15} /> Lọc nâng cao</button>
      </div>

      {/* Content Table */}
      <div className={styles.card} style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Đang tải dữ liệu...</div>
        ) : activeTab === 'guides' ? (
          <div className={styles.tableWrapper}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Mã HDV</th>
                  <th>Họ và tên</th>
                  <th>SĐT / Email</th>
                  <th>Hợp đồng</th>
                  <th>Định mức (Tour)</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredGuides.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40 }}>Không tìm thấy dữ liệu</td></tr>
                ) : filteredGuides.map(g => (
                  <tr key={g.id}>
                    <td style={{ fontWeight: 700, color: '#1e6fff' }}>{g.guideCode}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className={styles.guestAvatar}>{g.name.charAt(0)}</div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{g.name}</div>
                          <div style={{ fontSize: 12, color: '#64748b' }}>{g.speciality}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span style={{ fontSize: 13 }}><Phone size={11} style={{ marginRight: 4 }} />{g.phone}</span>
                        <span style={{ fontSize: 12, color: '#64748b' }}><Mail size={11} style={{ marginRight: 4 }} />{g.email || '—'}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`${styles.badge} ${g.contractType === 'FULLTIME' ? styles.active : styles.oos}`}>
                        {g.contractType}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{g.dailyRate.toLocaleString()}đ</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>{g.totalTours} tours ({new Date().getFullYear()})</div>
                    </td>
                    <td>
                      <span className={`${styles.badge} ${g.isActive ? styles.available : styles.inactive}`}>
                        {g.isActive ? 'Hoạt động' : 'Tạm dừng'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                        <button className={styles.btnIcon} onClick={() => { setEditingGuide(g); setShowGuideModal(true); }}>
                          <Edit2 size={14} />
                        </button>
                        <button className={styles.btnIcon} onClick={() => handleToggleStatus(g)}>
                          {g.isActive ? <XCircle size={14} color="#ef4444" /> : <CheckCircle size={14} color="#22c55e" />}
                        </button>
                        <button className={styles.btnIcon} onClick={() => handleDeleteGuide(g.id)}>
                          <Trash2 size={14} color="#64748b" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : activeTab === 'contracts' ? (
          <div className={styles.tableWrapper}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Mã HĐ</th>
                  <th>Hướng dẫn viên</th>
                  <th>Loại HĐ</th>
                  <th>Thời hạn</th>
                  <th>Lương cứng</th>
                  <th>Công tác phí</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {contracts.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40 }}>Chưa có hợp đồng nào</td></tr>
                ) : contracts.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 700 }}>{c.contractCode}</td>
                    <td style={{ fontWeight: 600 }}>{c.guideName}</td>
                    <td>{c.contractType}</td>
                    <td>
                      <div style={{ fontSize: 13 }}>{c.startDate}</div>
                      <div style={{ fontSize: 12, color: '#94a3b8' }}>đến {c.endDate || 'Vô thời hạn'}</div>
                    </td>
                    <td style={{ fontWeight: 700 }}>{c.basicSalary.toLocaleString()}đ</td>
                    <td style={{ fontWeight: 700, color: '#16a34a' }}>{c.dailyRate.toLocaleString()}đ</td>
                    <td>
                      <span className={`${styles.badge} ${c.status === 'ACTIVE' ? styles.active : styles.oos}`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Kỳ lương</th>
                  <th>Hướng dẫn viên</th>
                  <th>Số Tour</th>
                  <th>Thành tiền Tour</th>
                  <th>Lương cứng</th>
                  <th>Tổng lĩnh</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {salaries.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40 }}>Chưa có dữ liệu lương tháng này</td></tr>
                ) : salaries.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 700 }}>T{s.month}/{s.year}</td>
                    <td style={{ fontWeight: 600 }}>{s.guideName}</td>
                    <td style={{ textAlign: 'center', fontWeight: 700 }}>{s.tourCount}</td>
                    <td>{s.tourIncome.toLocaleString()}đ</td>
                    <td>{s.basicSalary.toLocaleString()}đ</td>
                    <td style={{ fontWeight: 800, color: '#1e6fff', fontSize: 15 }}>{s.totalPay.toLocaleString()}đ</td>
                    <td>
                      <span className={`${styles.badge} ${
                        s.status === 'PAID' ? styles.available : 
                        s.status === 'APPROVED' ? styles.active : styles.pending
                      }`}>
                        {s.status === 'PAID' ? 'Đã trả' : s.status === 'APPROVED' ? 'Đã duyệt' : 'Chờ duyệt'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                        {s.status === 'PENDING' && (
                          <button className={styles.btnSuccess} onClick={() => handleApproveSalary(s.id)}>
                            <CheckCircle size={14} /> Duyệt
                          </button>
                        )}
                        {s.status === 'APPROVED' && (
                          <button className={styles.btnPrimary} onClick={() => handleMarkPaid(s.id)}>
                            <DollarSign size={14} /> Trả lương
                          </button>
                        )}
                        <button className={styles.btnIcon}><FileText size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Guide Modal */}
      {showGuideModal && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>{editingGuide?.id ? 'Sửa Hướng Dẫn Viên' : 'Thêm Hướng Dẫn Viên Mới'}</h2>
              <button className={styles.btnIcon} onClick={() => setShowGuideModal(false)}><XCircle size={20} /></button>
            </div>
            <div className={styles.modalBody}>
              <form className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Mã HDV (để trống nếu tạo mới)</label>
                  <input 
                    placeholder="VD: HDV001" 
                    value={guideForm.guideCode || ''} 
                    onChange={e => setGuideForm({...guideForm, guideCode: e.target.value})}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Họ và tên HDV <span className={styles.required}>*</span></label>
                  <input 
                    placeholder="VD: Nguyễn Văn A" 
                    value={guideForm.name || ''} 
                    onChange={e => setGuideForm({...guideForm, name: e.target.value})}
                    required 
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Số điện thoại</label>
                  <input 
                    placeholder="09xxxxxxx" 
                    value={guideForm.phone || ''} 
                    onChange={e => setGuideForm({...guideForm, phone: e.target.value})}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Email</label>
                  <input 
                    type="email" 
                    placeholder="example@mail.com" 
                    value={guideForm.email || ''} 
                    onChange={e => setGuideForm({...guideForm, email: e.target.value})}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Ngôn ngữ</label>
                  <input 
                    placeholder="VD: Tiếng Anh, Tiếng Trung" 
                    value={guideForm.languages || ''} 
                    onChange={e => setGuideForm({...guideForm, languages: e.target.value})}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Chuyên môn / Khu vực</label>
                  <input 
                    placeholder="VD: Loop Tour, Trekking" 
                    value={guideForm.speciality || ''} 
                    onChange={e => setGuideForm({...guideForm, speciality: e.target.value})}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Định mức tour (đ/tour)</label>
                  <input 
                    type="number" 
                    value={guideForm.dailyRate || 0} 
                    onChange={e => setGuideForm({...guideForm, dailyRate: Number(e.target.value)})}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Loại hợp đồng</label>
                  <select 
                    value={guideForm.contractType || 'FREELANCE'} 
                    onChange={e => setGuideForm({...guideForm, contractType: e.target.value})}
                  >
                    <option value="FULLTIME">Full-time</option>
                    <option value="PARTTIME">Part-time</option>
                    <option value="FREELANCE">Freelance</option>
                  </select>
                </div>
                <div className={`${styles.formGroup} ${styles.fullSpan}`}>
                  <label>Giới thiệu ngắn</label>
                  <textarea 
                    placeholder="Kinh nghiệm, kỹ năng..." 
                    value={guideForm.bio || ''} 
                    onChange={e => setGuideForm({...guideForm, bio: e.target.value})}
                  ></textarea>
                </div>
              </form>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={() => setShowGuideModal(false)}>Hủy</button>
              <button className={styles.btnPrimary} onClick={handleSaveGuide}>Lưu thông tin</button>
            </div>
          </div>
        </div>
      )}

      {/* Contract & Salary modals could be added here similarly... */}
    </div>
  );
};

export default GuideManagementPage;
