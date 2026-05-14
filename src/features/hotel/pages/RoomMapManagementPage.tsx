import React, { useEffect, useMemo, useState } from 'react';
import { Bed, Building2, Edit2, Layers, Plus, RefreshCw, Save, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import styles from '../hotel.module.scss';
import hotelService from '../services/hotel.service';
import type { BedStatus, HotelAreaDto, RoomDetail, UpsertRoomRequest } from '../services/hotel.types';

const emptyRoom: UpsertRoomRequest = {
  so: '',
  ma: 'KHEPKIN',
  ten: '',
  floor: '',
  khuVucCode: '',
  areaId: null,
  maxPerson: 2,
  basePrice: 0,
  description: '',
  isActive: true,
};

const emptyBed = { bedCode: '', bedName: '', bedType: 'SINGLE', status: 'VC' };
const bedStatuses = ['VC', 'VD', 'OC', 'OD', 'EA', 'ED', 'OOS'];

const normalizeStatus = (status: string | undefined): string => {
  if (!status) return 'VC';
  const s = status.toUpperCase();
  if (s === 'VACANT' || s === 'AVAILABLE' || s === 'SACH TRONG' || s === 'SACH' || s === 'CLEAN') return 'VC';
  if (s === 'DIRTY' || s === 'VACANT_DIRTY' || s === 'BAN TRONG' || s === 'BAN' || s === 'VACANTDIRTY') return 'VD';
  if (s === 'OCCUPIED' || s === 'SACH CO KHACH' || s === 'CO KHACH') return 'OC';
  if (s === 'BAN CO KHACH' || s === 'ODIRTY' || s === 'OCCUPIEDDIRTY') return 'OD';
  return s;
};

const flattenAreas = (areas: HotelAreaDto[]): HotelAreaDto[] =>
  areas.flatMap(area => [area, ...flattenAreas(area.children ?? [])]);

export const RoomMapManagementPage: React.FC = () => {
  const [rooms, setRooms] = useState<RoomDetail[]>([]);
  const [areas, setAreas] = useState<HotelAreaDto[]>([]);
  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  const [selectedFloor, setSelectedFloor] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<RoomDetail | null>(null);
  const [roomForm, setRoomForm] = useState<UpsertRoomRequest>(emptyRoom);
  const [areaForm, setAreaForm] = useState<any>(null);
  const [bedForm, setBedForm] = useState(emptyBed);
  const [loading, setLoading] = useState(true);

  const areaOptions = useMemo(() => flattenAreas(areas), [areas]);
  const floors = useMemo(
    () => Array.from(new Set(rooms.map(r => r.floor).filter(Boolean) as string[])).sort(),
    [rooms],
  );
  const visibleRooms = selectedFloor ? rooms.filter(r => r.floor === selectedFloor) : rooms;

  const fetchData = async () => {
    setLoading(true);
    try {
      const [roomData, areaData, typeData] = await Promise.all([
        hotelService.getRooms(),
        hotelService.getAreas(),
        hotelService.getRoomTypes(),
      ]);
      setRooms(roomData);
      setAreas(areaData);
      setRoomTypes(typeData);
    } catch {
      toast.error('Lỗi tải dữ liệu sơ đồ phòng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreateRoom = () => {
    setSelectedRoom(null);
    setRoomForm({ ...emptyRoom, floor: selectedFloor });
    setBedForm(emptyBed);
  };

  const openEditRoom = (room: RoomDetail) => {
    setSelectedRoom(room);
    setRoomForm({
      id: room.id,
      so: room.so ?? '',
      ma: room.ma ?? 'KHEPKIN',
      ten: room.ten ?? '',
      floor: room.floor ?? '',
      khuVucCode: room.khuVucCode ?? '',
      maxPerson: room.maxPerson ?? 2,
      basePrice: room.basePrice ?? 0,
      description: room.description ?? '',
      isActive: room.isActive,
    });
    setBedForm(emptyBed);
  };

  const saveRoom = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const saved = await hotelService.upsertRoom(roomForm);
      toast.success(roomForm.id ? 'Đã cập nhật phòng' : 'Đã tạo phòng');
      await fetchData();
      openEditRoom(saved);
    } catch {
      toast.error('Không lưu được phòng');
    }
  };

  const deleteRoom = async (room: RoomDetail) => {
    if (!window.confirm(`Xóa phòng ${room.so}?`)) return;
    try {
      await hotelService.deleteRoom(room.id);
      toast.success('Đã xóa phòng');
      if (selectedRoom?.id === room.id) {
        setSelectedRoom(null);
        setRoomForm(emptyRoom);
      }
      fetchData();
    } catch {
      toast.error('Không xóa được phòng');
    }
  };

  const saveArea = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await hotelService.upsertArea(areaForm);
      toast.success(areaForm.id ? 'Đã cập nhật khu vực' : 'Đã tạo khu vực');
      setAreaForm(null);
      fetchData();
    } catch {
      toast.error('Không lưu được khu vực');
    }
  };

  const deleteArea = async (area: HotelAreaDto) => {
    if (!window.confirm(`Xóa khu vực ${area.areaName}?`)) return;
    try {
      await hotelService.deleteArea(area.id);
      toast.success('Đã xóa khu vực');
      fetchData();
    } catch {
      toast.error('Không xóa được khu vực');
    }
  };

  const saveBed = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!roomForm.so) return toast.error('Chọn phòng trước khi thêm giường');
    try {
      await hotelService.upsertBed(roomForm.so, bedForm.bedCode, bedForm.bedName, bedForm.bedType, bedForm.status);
      toast.success('Đã lưu giường');
      setBedForm(emptyBed);
      fetchData();
    } catch {
      toast.error('Không lưu được giường');
    }
  };

  const deleteBed = async (bed: BedStatus) => {
    if (!roomForm.so || !bed.bedCode || !window.confirm(`Xóa giường ${bed.bedCode}?`)) return;
    try {
      await hotelService.deleteBed(roomForm.so, bed.bedCode);
      toast.success('Đã xóa giường');
      fetchData();
    } catch {
      toast.error('Không xóa được giường');
    }
  };

  const renderAreaRows = (list: HotelAreaDto[], depth = 0): React.ReactNode =>
    list.map(area => (
      <React.Fragment key={area.id}>
        <tr>
          <td style={{ paddingLeft: 14 + depth * 18 }}>
            <strong>{area.areaName}</strong>
            <div style={{ fontSize: 12, color: '#64748b' }}>{area.areaCode || area.areaType}</div>
          </td>
          <td>{area.areaType}</td>
          <td>{area.roomCount ?? 0}</td>
          <td>
            <div style={{ display: 'flex', gap: 4 }}>
              <button className={styles.btnIconSm} onClick={() => setAreaForm({ ...area })}><Edit2 size={13} /></button>
              <button className={styles.btnIconSm} style={{ color: '#dc2626' }} onClick={() => deleteArea(area)}><Trash2 size={13} /></button>
            </div>
          </td>
        </tr>
        {renderAreaRows(area.children ?? [], depth + 1)}
      </React.Fragment>
    ));

  return (
    <div className={styles.hotelContainer}>
      <div className={styles.pageHeader}>
        <div>
          <h1>Quản lý sơ đồ phòng</h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13 }}>CRUD tầng, khu vực, phòng và giường theo dữ liệu PMS_Rooms.</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.btnSecondary} onClick={fetchData}><RefreshCw size={15} /> Làm mới</button>
          <button className={styles.btnSecondary} onClick={() => setAreaForm({ areaName: '', areaCode: '', areaType: 'FLOOR', color: '#3b82f6', isActive: true })}><Layers size={15} /> Thêm tầng</button>
          <button className={styles.btnPrimary} onClick={openCreateRoom}><Plus size={15} /> Thêm phòng</button>
        </div>
      </div>

      <div className={styles.tabs}>
        <button className={`${styles.tab} ${selectedFloor === '' ? styles.active : ''}`} onClick={() => setSelectedFloor('')}>Tất cả</button>
        {floors.map(floor => (
          <button key={floor} className={`${styles.tab} ${selectedFloor === floor ? styles.active : ''}`} onClick={() => setSelectedFloor(floor)}>
            Tầng {floor}
          </button>
        ))}
      </div>

      <div className={styles.splitLayout}>
        <div className={styles.leftPane}>
          <div className={styles.card} style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 15 }}>Danh sách phòng</h3>
              <span style={{ fontSize: 13, color: '#64748b' }}>{visibleRooms.length} phòng</span>
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>Phòng</th>
                    <th>Tầng</th>
                    <th>Loại</th>
                    <th>Giá</th>
                    <th>Trạng thái</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6}>Đang tải...</td></tr>
                  ) : visibleRooms.length === 0 ? (
                    <tr><td colSpan={6}>Chưa có phòng</td></tr>
                  ) : visibleRooms.map(room => (
                    <tr key={room.id} onClick={() => openEditRoom(room)}>
                      <td><strong>{room.so}</strong><div style={{ fontSize: 12, color: '#64748b' }}>{room.ten}</div></td>
                      <td>{room.floor || '-'}</td>
                      <td>{room.roomTypeName || room.ma}</td>
                      <td>{room.basePrice ? room.basePrice.toLocaleString('vi-VN') : 0}</td>
                      <td>
                        <span className={`${styles.badge} ${styles[normalizeStatus(room.status).toLowerCase()]}`}>
                          {normalizeStatus(room.status)}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                          <button className={styles.btnIconSm} onClick={(e) => { e.stopPropagation(); openEditRoom(room); }}><Edit2 size={13} /></button>
                          <button className={styles.btnIconSm} style={{ color: '#dc2626' }} onClick={(e) => { e.stopPropagation(); deleteRoom(room); }}><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 15 }}>Tầng / khu vực</h3>
              <button className={styles.btnSecondary} onClick={() => setAreaForm({ areaName: '', areaCode: '', areaType: 'FLOOR', color: '#3b82f6', isActive: true })}><Plus size={14} /> Thêm</button>
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.dataTable}>
                <thead><tr><th>Tên</th><th>Loại</th><th>Phòng</th><th></th></tr></thead>
                <tbody>{areas.length === 0 ? <tr><td colSpan={4}>Chưa có khu vực</td></tr> : renderAreaRows(areas)}</tbody>
              </table>
            </div>
          </div>
        </div>

        <div className={styles.rightPane}>
          <form className={styles.card} onSubmit={saveRoom}>
            <h3 style={{ marginTop: 0 }}>{roomForm.id ? `Sửa phòng ${roomForm.so}` : 'Thêm phòng'}</h3>
            <div className={`${styles.formGrid} ${styles.col1}`}>
              <div className={styles.formGroup}>
                <label>Số phòng</label>
                <input required value={roomForm.so} onChange={e => setRoomForm({ ...roomForm, so: e.target.value })} />
              </div>
              <div className={styles.formGroup}>
                <label>Tên phòng</label>
                <input value={roomForm.ten ?? ''} onChange={e => setRoomForm({ ...roomForm, ten: e.target.value })} />
              </div>
              <div className={styles.formGroup}>
                <label>Loại phòng</label>
                <select value={roomForm.ma} onChange={e => setRoomForm({ ...roomForm, ma: e.target.value })}>
                  <option value="KHEPKIN">KHEPKIN</option>
                  <option value="TAPTHE">TAPTHE</option>
                  {roomTypes.map(type => <option key={type.ma} value={type.ma}>{type.ten || type.ma}</option>)}
                </select>
              </div>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Tầng</label>
                  <input value={roomForm.floor ?? ''} onChange={e => setRoomForm({ ...roomForm, floor: e.target.value })} />
                </div>
                <div className={styles.formGroup}>
                  <label>Sức chứa</label>
                  <input type="number" min={1} value={roomForm.maxPerson ?? 1} onChange={e => setRoomForm({ ...roomForm, maxPerson: Number(e.target.value) })} />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Khu vực</label>
                <select value={roomForm.khuVucCode ?? ''} onChange={e => setRoomForm({ ...roomForm, khuVucCode: e.target.value })}>
                  <option value="">-- Chưa gán --</option>
                  {areaOptions.map(area => <option key={area.id} value={area.areaCode ?? ''}>{area.areaName}</option>)}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Giá cơ bản</label>
                <input type="number" min={0} value={roomForm.basePrice ?? 0} onChange={e => setRoomForm({ ...roomForm, basePrice: Number(e.target.value) })} />
              </div>
              <div className={styles.formGroup}>
                <label>Mô tả</label>
                <textarea value={roomForm.description ?? ''} onChange={e => setRoomForm({ ...roomForm, description: e.target.value })} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button type="submit" className={styles.btnPrimary}><Save size={15} /> Lưu phòng</button>
              <button type="button" className={styles.btnSecondary} onClick={openCreateRoom}><X size={15} /> Nhập mới</button>
            </div>
          </form>

          {roomForm.id && (
            <form className={styles.card} style={{ marginTop: 20 }} onSubmit={saveBed}>
              <h3 style={{ marginTop: 0 }}><Bed size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} /> Giường trong phòng</h3>
              <div className={styles.bedGrid}>
                {(selectedRoom?.beds ?? []).map(bed => {
                  const s = normalizeStatus(bed.status);
                  return (
                    <div key={bed.bedCode} className={`${styles.bedCell} ${styles[s.toLowerCase()] || styles.available}`}>
                      <div className={styles.bedCode}>{bed.bedCode}</div>
                      <div className={styles.bedGuest}>{bed.bedName || bed.bedType} · {s}</div>
                      <button type="button" className={styles.btnIconSm} style={{ margin: '6px auto 0', color: '#dc2626' }} onClick={() => deleteBed(bed)}><Trash2 size={12} /></button>
                    </div>
                  );
                })}
              </div>
              <div className={styles.formGrid} style={{ marginTop: 14 }}>
                <div className={styles.formGroup}>
                  <label>Mã giường</label>
                  <input required value={bedForm.bedCode} onChange={e => setBedForm({ ...bedForm, bedCode: e.target.value })} placeholder="B1" />
                </div>
                <div className={styles.formGroup}>
                  <label>Tên giường</label>
                  <input value={bedForm.bedName} onChange={e => setBedForm({ ...bedForm, bedName: e.target.value })} />
                </div>
              </div>
              <div className={styles.formGroup} style={{ marginTop: 10 }}>
                <label>Loại giường</label>
                <select value={bedForm.bedType} onChange={e => setBedForm({ ...bedForm, bedType: e.target.value })}>
                  <option value="SINGLE">SINGLE</option>
                  <option value="DOUBLE">DOUBLE</option>
                  <option value="BUNK">BUNK</option>
                </select>
              </div>
              <div className={styles.formGroup} style={{ marginTop: 10 }}>
                <label>Trạng thái giường</label>
                <select value={bedForm.status} onChange={e => setBedForm({ ...bedForm, status: e.target.value })}>
                  {bedStatuses.map(status => <option key={status} value={status}>{status}</option>)}
                </select>
              </div>
              <button type="submit" className={styles.btnPrimary} style={{ marginTop: 14 }}><Plus size={15} /> Lưu giường</button>
            </form>
          )}
        </div>
      </div>

      {areaForm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent} style={{ width: 460 }}>
            <div className={styles.modalHeader}>
              <h3>{areaForm.id ? 'Sửa khu vực' : 'Thêm khu vực'}</h3>
              <button className={styles.btnIcon} onClick={() => setAreaForm(null)}><X size={18} /></button>
            </div>
            <form className={styles.modalBody} onSubmit={saveArea}>
              <div className={styles.formGroup}>
                <label>Tên khu vực</label>
                <input required value={areaForm.areaName ?? ''} onChange={e => setAreaForm({ ...areaForm, areaName: e.target.value })} />
              </div>
              <div className={styles.formGrid} style={{ marginTop: 12 }}>
                <div className={styles.formGroup}>
                  <label>Mã</label>
                  <input value={areaForm.areaCode ?? ''} onChange={e => setAreaForm({ ...areaForm, areaCode: e.target.value })} />
                </div>
                <div className={styles.formGroup}>
                  <label>Loại</label>
                  <select value={areaForm.areaType ?? 'FLOOR'} onChange={e => setAreaForm({ ...areaForm, areaType: e.target.value })}>
                    <option value="BUILDING">BUILDING</option>
                    <option value="FLOOR">FLOOR</option>
                    <option value="WING">WING</option>
                    <option value="ZONE">ZONE</option>
                  </select>
                </div>
              </div>
              <div className={styles.formGroup} style={{ marginTop: 12 }}>
                <label>Thuộc khu vực</label>
                <select value={areaForm.parentId ?? ''} onChange={e => setAreaForm({ ...areaForm, parentId: e.target.value ? Number(e.target.value) : null })}>
                  <option value="">-- Cấp gốc --</option>
                  {areaOptions.filter(a => a.id !== areaForm.id).map(area => <option key={area.id} value={area.id}>{area.areaName}</option>)}
                </select>
              </div>
              <div className={styles.formGroup} style={{ marginTop: 12 }}>
                <label>Màu</label>
                <input type="color" value={areaForm.color ?? '#3b82f6'} onChange={e => setAreaForm({ ...areaForm, color: e.target.value })} />
              </div>
              <div className={styles.modalFooter} style={{ margin: '20px -28px -28px' }}>
                <button type="button" className={styles.btnSecondary} onClick={() => setAreaForm(null)}>Hủy</button>
                <button type="submit" className={styles.btnPrimary}>Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
