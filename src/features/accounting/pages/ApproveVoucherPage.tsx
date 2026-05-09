import React, { useEffect, useState } from 'react';
import styles from '../accounting.module.scss';
import { Search, Printer, CheckCircle, XCircle, Bot } from 'lucide-react';
import { accountingService } from '../services/accounting.service';
import { toast } from 'sonner';

export const ApproveVoucherPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all'); // all, pending, approved, rejected
  const [activeId, setActiveId] = useState<number | null>(null);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const data = await accountingService.getLedgerEntries();
      // Lọc ra các phiếu chi
      const paymentVouchers = (data || []).filter((v: any) => v.type === 'PhieuChi' || v.type === 'Phiếu chi' || v.orginalVoucherNumber?.startsWith('PC-'));
      setVouchers(paymentVouchers);
      if (paymentVouchers.length > 0 && !activeId) {
        setActiveId(paymentVouchers[0].id);
      }
    } catch (error) {
      toast.error('Lỗi khi tải danh sách phiếu chi');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number, isApproved: boolean) => {
    try {
      setSubmitting(true);
      const note = isApproved ? 'Kế toán trưởng đồng ý duyệt' : 'Không hợp lệ, từ chối';
      await accountingService.approvePaymentVoucher({
        ledgerId: id,
        isApproved,
        note
      });
      toast.success(isApproved ? 'Đã duyệt phiếu chi' : 'Đã từ chối phiếu chi');
      fetchVouchers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredVouchers = vouchers.filter((v: any) => {
    if (activeTab === 'pending') return v.status === 0;
    if (activeTab === 'approved') return v.status === 1;
    if (activeTab === 'rejected') return v.status === -1;
    return true;
  });

  const activeVoucher = vouchers.find(v => v.id === activeId);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN');
  };

  const getStatusInfo = (status: number) => {
    if (status === 1) return { label: 'Đã duyệt', bg: '#dcfce7', color: '#16a34a', border: '#bbf7d0' };
    if (status === -1) return { label: 'Đã từ chối', bg: '#fee2e2', color: '#dc2626', border: '#fecaca' };
    return { label: 'Chờ duyệt', bg: '#fef3c7', color: '#d97706', border: '#fde68a' };
  };

  // Group by date
  const groupedVouchers = filteredVouchers.reduce((acc: any, v: any) => {
    const d = formatDate(v.bookDate);
    if (!acc[d]) acc[d] = [];
    acc[d].push(v);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className={styles.accountingContainer} style={{ padding: 0, margin: 0 }}>
      <div className={styles.splitLayout}>
        {/* Left Pane - Master List */}
        <div className={styles.masterPane}>
          <div className={styles.masterHeader}>
            <div className={styles.formGroup} style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, color: '#666' }}>Mã đơn vị</label>
              <select style={{ padding: '8px' }}>
                <option>VP1 - CHI NHÁNH TỔNG CÔNG TY</option>
              </select>
            </div>
            
            <div className={styles.searchBox} style={{ marginBottom: 12 }}>
              <Search size={16} color="#888" />
              <input type="text" placeholder="Tìm số phiếu, diễn giải..." />
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <div className={styles.formGroup} style={{ flex: 1, marginBottom: 0 }}>
                <label style={{ fontSize: 12, color: '#666' }}>Từ ngày</label>
                <input type="date" defaultValue="2026-04-01" style={{ padding: '8px' }} />
              </div>
              <div className={styles.formGroup} style={{ flex: 1, marginBottom: 0 }}>
                <label style={{ fontSize: 12, color: '#666' }}>Đến ngày</label>
                <input type="date" defaultValue="2026-04-30" style={{ padding: '8px' }} />
              </div>
            </div>
          </div>

          <div className={styles.masterTabs}>
            <div className={`${styles.masterTab} ${activeTab === 'all' ? styles.masterTabActive : ''}`} onClick={() => setActiveTab('all')}>Tất cả</div>
            <div className={`${styles.masterTab} ${activeTab === 'pending' ? styles.masterTabActive : ''}`} onClick={() => setActiveTab('pending')}>Chờ duyệt</div>
            <div className={`${styles.masterTab} ${activeTab === 'approved' ? styles.masterTabActive : ''}`} onClick={() => setActiveTab('approved')}>Đã duyệt</div>
            <div className={`${styles.masterTab} ${activeTab === 'rejected' ? styles.masterTabActive : ''}`} onClick={() => setActiveTab('rejected')}>Đã từ chối</div>
          </div>

          <div className={styles.masterList}>
            {loading ? (
              <div style={{ padding: 20, textAlign: 'center' }}>Đang tải dữ liệu...</div>
            ) : filteredVouchers.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', color: '#666' }}>Không có phiếu chi nào</div>
            ) : (
              Object.keys(groupedVouchers).sort((a, b) => b.localeCompare(a)).map(date => {
                const group = groupedVouchers[date];
                const totalAmount = group.reduce((sum: number, v: any) => sum + (v.amount || 0), 0);
                
                return (
                  <React.Fragment key={date}>
                    <div style={{ padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>{date}</span>
                      <span style={{ fontSize: 12, color: '#2563eb', fontWeight: 600 }}>{totalAmount.toLocaleString()} đ</span>
                    </div>
                    <div style={{ padding: '0 16px', fontSize: 11, color: '#64748b', background: '#f8fafc', paddingBottom: 8 }}>
                      {group.length} chứng từ • {totalAmount.toLocaleString()} đ
                    </div>

                    {group.map((v: any) => {
                      const statusInfo = getStatusInfo(v.status || 0);
                      return (
                        <div 
                          key={v.id} 
                          className={`${styles.masterCard} ${activeId === v.id ? styles.masterCardActive : ''}`}
                          onClick={() => setActiveId(v.id)}
                        >
                          <div className={styles.cardTop}>
                            <span className={styles.cardTitle}>{v.orginalVoucherNumber}</span>
                            <span style={{ fontSize: 11, background: statusInfo.bg, color: statusInfo.color, padding: '2px 8px', borderRadius: 12, fontWeight: 500 }}>
                              {statusInfo.label}
                            </span>
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{v.detail1 || 'Không rõ'}</div>
                          <div className={styles.cardSubtitle}>{v.orginalDescription}</div>
                          <div className={styles.cardAmount}>{v.amount?.toLocaleString()} đ</div>
                        </div>
                      );
                    })}
                  </React.Fragment>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane - Detail View */}
        {activeVoucher ? (
          <div className={styles.detailPane}>
            <div className={styles.detailHeader}>
              <div>
                <div className={styles.detailTitle}>{activeVoucher.orginalVoucherNumber}</div>
                <div className={styles.detailSubtitle}>{activeVoucher.orginalDescription}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, color: '#ea580c', fontWeight: 500, marginBottom: 8, background: '#fff7ed', padding: '4px 12px', borderRadius: 20, border: '1px solid #ffedd5' }}>
                  Bạn đang có quyền duyệt: Cấp Kế toán trưởng
                </div>
                <span style={{ 
                  fontSize: 13, 
                  color: getStatusInfo(activeVoucher.status).color, 
                  background: getStatusInfo(activeVoucher.status).bg,
                  border: `1px solid ${getStatusInfo(activeVoucher.status).border}`, 
                  padding: '4px 16px', 
                  borderRadius: 20, 
                  fontWeight: 600, 
                  display: 'inline-block' 
                }}>
                  {getStatusInfo(activeVoucher.status).label}
                </span>
              </div>
            </div>

            <div className={styles.infoGrid}>
              <div className={styles.infoBox}>
                <div className={styles.infoLabel}>Ngày lập chứng từ</div>
                <div className={styles.infoValue}>{formatDate(activeVoucher.bookDate)}</div>
              </div>
              <div className={styles.infoBox}>
                <div className={styles.infoLabel}>Người nhận tiền</div>
                <div className={styles.infoValue}>{activeVoucher.detail1 || 'Không có'}</div>
              </div>
              <div className={styles.infoBox}>
                <div className={styles.infoLabel}>Mã số thuế / CMND</div>
                <div className={styles.infoValue}>{activeVoucher.detail2 || 'N/A'}</div>
              </div>
              <div className={styles.infoBox} style={{ background: '#eff6ff', borderColor: '#bfdbfe' }}>
                <div className={styles.infoLabel} style={{ color: '#2563eb' }}>Số tiền (VND)</div>
                <div className={styles.infoValue} style={{ color: '#1d4ed8', fontSize: '18px' }}>
                  {activeVoucher.amount?.toLocaleString()} đ
                </div>
              </div>
            </div>

            <div className={styles.detailContent}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#2563eb', margin: 0 }}>
                  <div style={{ width: 16, height: 16, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4 }}>
                    <div style={{ width: 8, height: 2, background: '#3b82f6' }}></div>
                  </div>
                  CHI TIẾT HẠCH TOÁN (ĐỊNH KHOẢN)
                </h3>
              </div>

              <table className={styles.dataGrid}>
                <thead>
                  <tr>
                    <th style={{ width: 40, textAlign: 'center' }}>#</th>
                    <th>Diễn giải</th>
                    <th style={{ width: 120, textAlign: 'center' }}>TK Nợ</th>
                    <th style={{ width: 120, textAlign: 'center' }}>TK Có</th>
                    <th style={{ width: 150, textAlign: 'right' }}>Số tiền</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ textAlign: 'center' }}>1</td>
                    <td>{activeVoucher.orginalDescription}</td>
                    <td style={{ textAlign: 'center', fontWeight: 600, color: '#ef4444' }}>{activeVoucher.debitCode}</td>
                    <td style={{ textAlign: 'center', fontWeight: 600, color: '#10b981' }}>{activeVoucher.creditCode}</td>
                    <td style={{ textAlign: 'right', fontWeight: 500 }}>{activeVoucher.amount?.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className={styles.detailFooter}>
              {activeVoucher.status === 0 ? (
                <>
                  <button 
                    onClick={() => handleApprove(activeVoucher.id, false)}
                    disabled={submitting}
                    style={{ background: '#fff', color: '#ef4444', border: '1px solid #ef4444', padding: '8px 16px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500, cursor: submitting ? 'not-allowed' : 'pointer' }}
                  >
                    <XCircle size={16} /> Từ chối duyệt
                  </button>
                  <button 
                    onClick={() => handleApprove(activeVoucher.id, true)}
                    disabled={submitting}
                    style={{ background: '#10b981', color: '#fff', border: 'none', padding: '8px 24px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer' }}
                  >
                    <CheckCircle size={16} /> Duyệt chi
                  </button>
                </>
              ) : (
                <button 
                  style={{ background: '#fff', color: '#3b82f6', border: '1px solid #bfdbfe', padding: '8px 16px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500, cursor: 'pointer' }}
                >
                  <Printer size={16} /> In phiếu chi
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className={styles.detailPane} style={{ alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
            Chọn một phiếu chi để xem chi tiết
          </div>
        )}
      </div>

      <button style={{ position: 'fixed', bottom: 32, right: 32, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 30, padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)', cursor: 'pointer', fontWeight: 600, zIndex: 100 }}>
        <Bot size={20} /> Trợ lý AI
      </button>
    </div>
  );
};

export default ApproveVoucherPage;
