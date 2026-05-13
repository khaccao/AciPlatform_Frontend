import api from '../../../core/services/api.service';

import type { 
  RoomDetail, BookingDto, CreateBookingRequest, VehicleDto, 
  VehicleRentalDto, HotelTourDto, HotelGuest, HotelServiceDto, 
  HotelTourGuideDto, GuideContractDto, GuideSalaryDto, DashboardData 
} from './hotel.types';

const getStoredCompanyCode = () => {
  const selected = localStorage.getItem('selectedCompanyCode')
    || localStorage.getItem('selectedHotelCode')
    || localStorage.getItem('dbName');

  if (selected) return selected;

  try {
    return JSON.parse(localStorage.getItem('user') || '{}')?.companyCode || '';
  } catch {
    return '';
  }
};

// --- Service Implementation ---
class HotelService {
  get code() {
    return getStoredCompanyCode();
  }

  setHotelCode(code: string) {
    this.setCompanyCode(code);
  }

  setCompanyCode(code: string) {
    localStorage.setItem('selectedCompanyCode', code);
    localStorage.setItem('selectedHotelCode', code);
    localStorage.setItem('dbName', code);
  }

  async getCompanies() {
    const r = await api.get('/Companies');
    return (r.data?.data ?? r.data ?? []).map((item: any) => ({
      ...item,
      code: item.code ?? item.Code,
      name: item.name ?? item.Name,
      isHotel: item.isHotel ?? item.IsHotel,
    }));
  }

  async getHotels() {
    return this.getCompanies();
  }

  // Dashboard
  async getDashboard(): Promise<DashboardData> {
    const r = await api.get(`/hotel-bookings/${this.code}/dashboard`);
    return r.data?.data ?? r.data;
  }

  // Rooms
  async getRooms(floor?: string, roomType?: string): Promise<RoomDetail[]> {
    const params = new URLSearchParams();
    if (floor) params.append('floor', floor);
    if (roomType) params.append('roomType', roomType);
    const r = await api.get(`/hotel-property/${this.code}/rooms?${params}`);
    return r.data?.data ?? r.data ?? [];
  }

  async getRoomMap() {
    const r = await api.get(`/hotel-rooms/${this.code}/map`);
    return r.data?.data ?? r.data;
  }

  async getRoomAvailability(checkIn: string, checkOut: string) {
    const r = await api.get(`/hotel-rooms/${this.code}/availability?checkIn=${checkIn}&checkOut=${checkOut}`);
    return r.data?.data ?? r.data;
  }

  async getRoomForecast(from: string, to: string) {
    const r = await api.get(`/hotel-rooms/${this.code}/forecast?fromDate=${from}&toDate=${to}`);
    return r.data?.data ?? r.data ?? [];
  }

  async getRoomRack(fromDate: string, days: number) {
    const r = await api.get(`/hotel-rooms/${this.code}/room-rack?fromDate=${fromDate}&days=${days}`);
    return r.data?.data ?? r.data;
  }

  async moveRoomRackBooking(data: object) {
    const r = await api.patch(`/hotel-rooms/${this.code}/room-rack/move`, data);
    return r.data;
  }

  async updateRoomStatus(roomNo: string, status: string, cleanDirty?: number) {
    const r = await api.patch(`/hotel-rooms/${this.code}/status`, { roomNo, status, cleanDirty });
    return r.data;
  }

  async upsertRoom(data: any): Promise<RoomDetail> {
    if (data.id) {
      const r = await api.put(`/hotel-property/${this.code}/rooms/${data.id}`, { ...data, hotelCode: this.code });
      return r.data?.data ?? r.data;
    }
    const r = await api.post(`/hotel-property/${this.code}/rooms`, { ...data, hotelCode: this.code });
    return r.data?.data ?? r.data;
  }

  async deleteRoom(id: number) {
    await api.delete(`/hotel-property/${this.code}/rooms/${id}`);
  }

  async getBeds(roomNo: string) {
    const r = await api.get(`/hotel-rooms/${this.code}/${roomNo}/beds`);
    return r.data?.data ?? r.data ?? [];
  }

  async upsertBed(roomNo: string, bedCode: string, bedName: string, bedType: string, status?: string) {
    const r = await api.put(`/hotel-rooms/${this.code}/${roomNo}/beds/${bedCode}`, { bedName, bedType, status });
    return r.data?.data ?? r.data;
  }

  async updateBedStatus(roomNo: string, bedCode: string, status: string) {
    const r = await api.patch(`/hotel-rooms/${this.code}/${roomNo}/beds/${bedCode}/status`, { status });
    return r.data;
  }

  async deleteBed(roomNo: string, bedCode: string) {
    await api.delete(`/hotel-rooms/${this.code}/${roomNo}/beds/${bedCode}`);
  }

  async blockRoom(data: any) {
    const r = await api.post(`/hotel-rooms/${this.code}/block`, { ...data, hotelCode: this.code });
    return r.data;
  }

  async unblockRoom(roomNo: string, bedCode: string | undefined, fromDate: string, toDate: string) {
    const params = new URLSearchParams({ roomNo, fromDate, toDate });
    if (bedCode) params.append('bedCode', bedCode);
    const r = await api.delete(`/hotel-rooms/${this.code}/block?${params}`);
    return r.data;
  }

  // Bookings
  async getBookings(params: Record<string, string | number>): Promise<{ items: BookingDto[]; total: number }> {
    const qs = new URLSearchParams({ hotelCode: this.code, page: '1', pageSize: '50', ...Object.fromEntries(Object.entries(params).map(([k,v])=>[k, String(v)])) });
    const r = await api.get(`/hotel-bookings?${qs}`);
    const d = r.data?.data ?? r.data;
    return { items: d?.items ?? d ?? [], total: d?.total ?? 0 };
  }

  async getBookingById(id: number): Promise<BookingDto> {
    const r = await api.get(`/hotel-bookings/${id}`);
    return r.data?.data ?? r.data;
  }

  async createBooking(req: CreateBookingRequest): Promise<BookingDto> {
    const r = await api.post('/hotel-bookings', {
      ...req,
      hotelCode: this.code,
      guestIdCard: req.guestIdCard || (req as any).idCard || '',
      guestEmail: req.guestEmail || (req as any).guestEmail || '',
      paidAmount: req.depositAmount || (req as any).paidAmount || 0,
    });
    return r.data?.data ?? r.data;
  }

  async addServiceToBooking(bookingId: number, data: { serviceCode: string; serviceName?: string; category?: string; quantity: number; unitPrice: number; }) {
    const r = await api.post(`/hotel-bookings/${bookingId}/services`, data);
    return r.data?.data ?? r.data;
  }

  async deleteBookingService(bookingId: number, serviceCode: string) {
    const r = await api.delete(`/hotel-bookings/${bookingId}/services/${serviceCode}`);
    return r.data;
  }

  // Services Catalog
  async getServiceCatalog(category?: string) {
    const qs = category ? `?category=${category}` : '';
    const r = await api.get(`/hotel-bookings/${this.code}/services${qs}`);
    return r.data?.data ?? r.data ?? [];
  }
  async upsertServiceCatalog(data: any) {
    const r = await api.post('/hotel-bookings/services', { ...data, hotelCode: this.code });
    return r.data?.data ?? r.data;
  }
  async deleteServiceCatalog(id: number) {
    await api.delete(`/hotel-bookings/services/${id}`);
  }

  // Room Map (Areas & Elements)
  async getAreas() {
    const r = await api.get(`/hotel-property/${this.code}/areas`);
    return r.data?.data ?? r.data ?? [];
  }
  async upsertArea(data: any) {
    if (data.id) {
      const r = await api.put(`/hotel-property/${this.code}/areas/${data.id}`, { ...data, hotelCode: this.code });
      return r.data?.data ?? r.data;
    }
    const r = await api.post(`/hotel-property/${this.code}/areas`, { ...data, hotelCode: this.code });
    return r.data?.data ?? r.data;
  }
  async deleteArea(id: number) {
    await api.delete(`/hotel-property/${this.code}/areas/${id}`);
  }

  async getElements(areaId?: number) {
    if (!areaId) return [];
    const r = await api.get(`/hotel-property/${this.code}/areas/${areaId}/elements`);
    return r.data?.data ?? r.data ?? [];
  }
  async upsertElement(data: any) {
    const r = await api.post(`/hotel-property/${this.code}/areas/${data.areaId}/elements`, data);
    return r.data?.data ?? r.data;
  }
  async deleteElement(id: number) {
    await api.delete(`/hotel-property/${this.code}/areas/0/elements/${id}`);
  }

  async updateBookingStatus(id: number, status: string, paidAmount?: number, cancelReason?: string) {
    const r = await api.patch(`/hotel-bookings/${id}/status`, { bookingId: id, status, paidAmount, cancelReason });
    return r.data;
  }

  async generateInvoice(id: number, paymentMethod: string) {
    const r = await api.post(`/hotel-bookings/${id}/invoice`, { paymentMethod });
    return r.data?.data ?? r.data;
  }

  // Vehicles
  async getVehicles(status?: string): Promise<VehicleDto[]> {
    const qs = status ? `?status=${status}` : '';
    const r = await api.get(`/hotel-vehicles/${this.code}${qs}`);
    return r.data?.data ?? r.data ?? [];
  }

  async getActiveRentals(): Promise<VehicleRentalDto[]> {
    const r = await api.get(`/hotel-vehicles/${this.code}/rentals/active`);
    return r.data?.data ?? r.data ?? [];
  }

  async getRentalHistory(): Promise<VehicleRentalDto[]> {
    const r = await api.get(`/hotel-vehicles/${this.code}/rentals/history`);
    return r.data?.data ?? r.data ?? [];
  }

  async createRental(req: object): Promise<VehicleRentalDto> {
    const r = await api.post('/hotel-vehicles/rentals', { ...req, hotelCode: this.code });
    return r.data?.data ?? r.data;
  }

  async returnVehicle(rentalId: number, req: object) {
    const r = await api.post(`/hotel-vehicles/rentals/${rentalId}/return`, req);
    return r.data;
  }

  async upsertVehicle(data: any) {
    if (data.id) {
      const r = await api.put(`/hotel-vehicles/${data.id}`, data);
      return r.data?.data ?? r.data;
    } else {
      const r = await api.post('/hotel-vehicles', { ...data, hotelCode: this.code });
      return r.data?.data ?? r.data;
    }
  }

  async deleteVehicle(id: number) {
    await api.delete(`/hotel-vehicles/${id}`);
  }

  // Tours
  async getTours(tourType?: string): Promise<HotelTourDto[]> {
    const qs = tourType ? `?tourType=${tourType}` : '';
    const r = await api.get(`/hotel-tours/${this.code}${qs}`);
    return r.data?.data ?? r.data ?? [];
  }

  async upsertTour(data: object) {
    const r = await api.post('/hotel-tours', { ...data, hotelCode: this.code });
    return r.data?.data ?? r.data;
  }

  async deleteTour(id: number) {
    await api.delete(`/hotel-tours/${id}`);
  }

  // Guides
  async getGuides(isActive?: boolean): Promise<HotelTourGuideDto[]> {
    const qs = isActive !== undefined ? `?isActive=${isActive}` : '';
    const r = await api.get(`/hotel-guides/${this.code}${qs}`);
    return r.data?.data ?? r.data ?? [];
  }

  async getGuideById(id: number): Promise<HotelTourGuideDto> {
    const r = await api.get(`/hotel-guides/${this.code}/${id}`);
    return r.data?.data ?? r.data;
  }

  async upsertGuide(data: object) {
    const r = await api.post('/hotel-guides', { ...data, hotelCode: this.code });
    return r.data?.data ?? r.data;
  }

  async deleteGuide(id: number) {
    await api.delete(`/hotel-guides/${id}`);
  }

  async toggleGuideStatus(id: number, isActive: boolean) {
    const r = await api.patch(`/hotel-guides/${id}/toggle?isActive=${isActive}`);
    return r.data;
  }

  async getGuideStats(id: number, year?: number) {
    const y = year || new Date().getFullYear();
    const r = await api.get(`/hotel-guides/${this.code}/${id}/stats?year=${y}`);
    return r.data?.data ?? r.data;
  }

  // Guide Contracts
  async getGuideContracts(guideId?: number): Promise<GuideContractDto[]> {
    const qs = guideId ? `?guideId=${guideId}` : '';
    const r = await api.get(`/hotel-guides/${this.code}/contracts${qs}`);
    return r.data?.data ?? r.data ?? [];
  }

  async createGuideContract(data: object) {
    const r = await api.post('/hotel-guides/contracts', { ...data, hotelCode: this.code });
    return r.data?.data ?? r.data;
  }

  async updateGuideContractStatus(id: number, status: string) {
    const r = await api.patch(`/hotel-guides/contracts/${id}/status?status=${status}`);
    return r.data;
  }

  // Guide Salaries
  async getGuideSalaries(month?: number, year?: number): Promise<GuideSalaryDto[]> {
    const params = new URLSearchParams();
    if (month) params.append('month', String(month));
    if (year) params.append('year', String(year));
    const r = await api.get(`/hotel-guides/${this.code}/salaries?${params}`);
    return r.data?.data ?? r.data ?? [];
  }

  async calculateGuideSalary(data: object) {
    const r = await api.post('/hotel-guides/salaries/calculate', { ...data, hotelCode: this.code });
    return r.data?.data ?? r.data;
  }

  async approveGuideSalary(id: number) {
    const r = await api.patch(`/hotel-guides/salaries/${id}/approve`);
    return r.data;
  }

  async markGuideSalaryPaid(id: number) {
    const r = await api.patch(`/hotel-guides/salaries/${id}/paid`);
    return r.data;
  }

  async getTourSchedules(tourCode?: string, from?: string, to?: string) {
    const qs = new URLSearchParams();
    if (tourCode) qs.append('tourCode', tourCode);
    if (from) qs.append('from', from);
    if (to) qs.append('to', to);
    const r = await api.get(`/hotel-tours/${this.code}/schedules?${qs}`);
    return r.data?.data ?? r.data ?? [];
  }

  async upsertSchedule(data: object) {
    const r = await api.post(`/hotel-tours/${this.code}/schedules`, { ...data, hotelCode: this.code });
    return r.data?.data ?? r.data;
  }

  // Guests
  async getGuests(search?: string): Promise<HotelGuest[]> {
    const qs = search ? `?search=${encodeURIComponent(search)}` : '';
    const r = await api.get(`/hotel-guests/${this.code}${qs}`);
    return r.data?.data ?? r.data ?? [];
  }

  async getGuestByPhone(phone: string): Promise<HotelGuest | null> {
    try {
      const r = await api.get(`/hotel-guests/${this.code}/by-phone/${phone}`);
      return r.data?.data ?? r.data;
    } catch { return null; }
  }

  // Services catalog
  async getServices(category?: string): Promise<HotelServiceDto[]> {
    const qs = category ? `?category=${category}` : '';
    const r = await api.get(`/hotel-services/${this.code}${qs}`);
    return r.data?.data ?? r.data ?? [];
  }

  async upsertService(data: object) {
    const r = await api.post('/hotel-services', { ...data, hotelCode: this.code });
    return r.data?.data ?? r.data;
  }

  async deleteService(id: number) {
    await api.delete(`/hotel-services/${id}`);
  }

  // Reports
  async getOccupancyReport(from: string, to: string) {
    const r = await api.get(`/hotel-reports/${this.code}/occupancy?from=${from}&to=${to}`);
    return r.data?.data ?? r.data ?? [];
  }

  async getRevenueByMonth(year?: number) {
    const y = year || new Date().getFullYear();
    const r = await api.get(`/hotel-reports/${this.code}/revenue/monthly?year=${y}`);
    return r.data?.data ?? r.data ?? [];
  }

  async getRevenueToday() {
    const r = await api.get(`/hotel-reports/${this.code}/revenue/today`);
    return r.data?.data ?? r.data;
  }

  async getVehicleUtilization(from: string, to: string) {
    const r = await api.get(`/hotel-reports/${this.code}/vehicles/utilization?from=${from}&to=${to}`);
    return r.data?.data ?? r.data ?? [];
  }

  // Room Types
  async getRoomTypes() {
    const r = await api.get(`/hotel-property/${this.code}/room-types`);
    return r.data?.data ?? r.data ?? [];
  }

  // Settings
  async getSettings() {
    const r = await api.get(`/hotel-property/${this.code}/settings`);
    return r.data?.data ?? r.data ?? [];
  }

  async upsertSetting(key: string, value: string, description?: string) {
    const r = await api.post(`/hotel-property/${this.code}/settings`, { key, value, description });
    return r.data;
  }

  // Group members
  async getGroupMembers(bookingId: number) {
    const r = await api.get(`/hotel-tours/bookings/${bookingId}/members`);
    return r.data?.data ?? r.data ?? [];
  }

  async addGroupMember(bookingId: number, data: object) {
    const r = await api.post(`/hotel-tours/bookings/${bookingId}/members`, { ...data, hotelCode: this.code, bookingId });
    return r.data?.data ?? r.data;
  }
}

export * from './hotel.types';
export const hotelService = new HotelService();
export default hotelService;



