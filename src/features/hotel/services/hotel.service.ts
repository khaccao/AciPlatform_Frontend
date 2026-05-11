import api from '../../../core/services/api.service';

const HOTEL_CODE = 'HOMEHG';

// â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export interface RoomDetail {
  id: number; so?: string; ma?: string; ten?: string; floor?: string;
  khuVucCode?: string; status?: string; cleanDirty?: number;
  maxPerson?: number; basePrice?: number; roomTypeName?: string;
  description?: string; isActive: boolean;
  beds: BedStatus[];
}

export interface BedStatus {
  bedCode: string; bedName?: string; bedType?: string; status?: string;
}

export interface BookingDto {
  id: number; bookingCode: string; bookingType: string;
  guestName: string; guestPhone: string; nationality?: string;
  checkIn: string; checkOut: string; nightCount: number;
  roomPrice: number; servicePrice: number; vehiclePrice: number;
  discountAmount: number; totalAmount: number; paidAmount: number;
  depositAmount: number; status: string; source?: string;
  groupName?: string; groupSize: number; notes?: string;
  createdDate: string;
  rooms: BookingRoomDetail[];
  services: BookingServiceDetail[];
}

export interface BookingRoomDetail {
  roomNo: string; bedCode?: string; guestName?: string;
  pricePerNight: number; totalPrice: number; status: string;
}

export interface BookingServiceDetail {
  serviceCode: string; serviceName?: string; category?: string;
  quantity: number; unit?: string; unitPrice: number; totalPrice: number;
}

export interface CreateBookingRequest {
  hotelCode: string; bookingType: string; guestName: string;
  guestPhone: string; guestIdCard?: string; nationality?: string;
  checkIn: string; checkOut: string;
  rooms: { roomNo: string; bedCode?: string; guestName?: string; pricePerNight: number; nightCount: number; }[];
  services: { serviceCode: string; quantity: number; unitPrice: number; serviceDate?: string; notes?: string; }[];
  discountAmount: number; depositAmount: number;
  source?: string; groupName?: string; groupSize?: number;
  notes?: string; specialRequests?: string; createdBy?: number;
}

export interface VehicleDto {
  id: number; vehicleCode: string; licensePlate?: string; vehicleName?: string;
  vehicleType?: string; status?: string; fuelLevel?: number;
  pricePerDay: number; depositAmount: number; imageUrl?: string;
  condition?: string; isActive: boolean;
}

export interface VehicleRentalDto {
  id: number; rentalCode: string; vehicleCode: string; vehicleName?: string;
  licensePlate?: string; bookingId?: number; guestName: string;
  guestPhone?: string; rentFrom: string; rentTo: string;
  totalDays: number; totalAmount: number; depositAmount: number;
  depositReturned: number; damageFee: number; status: string;
}

export interface HotelTourDto {
  id: number; tourCode: string; tourName: string; tourNameEN?: string;
  tourType: string; durationDays: number; durationNights: number;
  maxPerson: number; minPerson: number; pricePerPerson: number;
  groupPrice: number; groupDiscountFrom?: number;
  highlights?: string; itinerary?: string; inclusions?: string; exclusions?: string;
  meetingPoint?: string; difficulty: string;
  imageUrl?: string; isAvailable: boolean; availableSlots: number; sortOrder?: number;
}

export interface HotelGuest {
  id: number; guestName: string; phone?: string; email?: string;
  idCard?: string; nationality?: string; totalVisits: number;
  totalSpent: number; lastVisit?: string; isVip: boolean;
  preferredRoomType?: string; preferredVehicleType?: string; notes?: string;
}

export interface HotelService {
  id: number; serviceCode: string; serviceName: string; category: string;
  subCategory?: string; unit?: string; unitPrice: number; description?: string;
  isAvailable: boolean; imageUrl?: string;
}

export interface DashboardData {
  checkInsToday: number; checkOutsToday: number;
  inHouse: number; todayRevenue: number;
}

// â”€â”€ Service â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
class HotelService {
  private code = HOTEL_CODE;

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
    const r = await api.get(`/hotel-rooms/${this.code}/forecast?from=${from}&to=${to}`);
    return r.data?.data ?? r.data ?? [];
  }

  async updateRoomStatus(roomNo: string, status: string, cleanDirty?: number) {
    const r = await api.patch(`/hotel-rooms/${this.code}/status`, { roomNo, status, cleanDirty });
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
    const r = await api.post('/hotel-bookings', { ...req, hotelCode: this.code });
    return r.data?.data ?? r.data;
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

  async createRental(req: object): Promise<VehicleRentalDto> {
    const r = await api.post('/hotel-vehicles/rentals', { ...req, hotelCode: this.code });
    return r.data?.data ?? r.data;
  }

  async returnVehicle(rentalId: number, req: object) {
    const r = await api.post(`/hotel-vehicles/rentals/${rentalId}/return`, req);
    return r.data;
  }

  async upsertVehicle(data: object) {
    const r = await api.post('/hotel-vehicles', { ...data, hotelCode: this.code });
    return r.data?.data ?? r.data;
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

  async getGuides() {
    const r = await api.get(`/hotel-tours/${this.code}/guides`);
    return r.data?.data ?? r.data ?? [];
  }

  async upsertGuide(data: object) {
    const r = await api.post(`/hotel-tours/${this.code}/guides`, { ...data, hotelCode: this.code });
    return r.data?.data ?? r.data;
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
  async getServices(category?: string): Promise<HotelService[]> {
    const qs = category ? `?category=${category}` : '';
    const r = await api.get(`/hotel-services-catalog/${this.code}${qs}`);
    return r.data?.data ?? r.data ?? [];
  }

  async upsertService(data: object) {
    const r = await api.post('/hotel-services-catalog', { ...data, hotelCode: this.code });
    return r.data?.data ?? r.data;
  }

  async deleteService(id: number) {
    await api.delete(`/hotel-services-catalog/${id}`);
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

export const hotelService = new HotelService();
export default hotelService;



