export interface RoomDetail {
  id: number; so?: string; ma?: string; ten?: string; floor?: string;
  khuVucCode?: string; status?: string; cleanDirty?: number;
  inspected?: number; maxPerson?: number; basePrice?: number; roomTypeName?: string;
  description?: string; isActive: boolean;
  beds: BedStatus[];
}

export interface BedStatus {
  bedCode: string; bedName?: string; bedType?: string; status?: string;
  isAvailable?: boolean; guestName?: string;
}

export interface BookingDto {
  id: number; bookingCode: string; bookingType: string;
  guestName: string; guestPhone: string; nationality?: string;
  guestEmail?: string; idCard?: string;
  checkIn: string; checkOut: string; nightCount: number;
  roomPrice: number; servicePrice: number; vehiclePrice: number;
  discountAmount: number; totalAmount: number; paidAmount: number;
  depositAmount: number; status: string; source?: string;
  groupName?: string; groupSize: number; notes?: string;
  createdDate: string; createdAt?: string; updatedAt?: string;
  rooms: BookingRoomDetail[];
  services: BookingServiceDetail[];
}

export interface BookingRoomDetail {
  roomNo: string; bedCode?: string; guestName?: string;
  roomTypeName?: string;
  pricePerNight: number; totalPrice: number; status: string;
}

export interface BookingServiceDetail {
  serviceCode: string; serviceName?: string; category?: string;
  quantity: number; unit?: string; unitPrice: number; totalPrice: number;
}

export interface CreateBookingRequest {
  hotelCode: string; bookingType: string; guestName: string;
  guestPhone: string; guestEmail?: string; guestIdCard?: string; nationality?: string;
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
  actualReturnDate?: string;
  totalDays: number; totalAmount: number; paidAmount: number; 
  depositAmount: number; depositReturned: number; damageFee: number; 
  status: string; notes?: string; isOverdue: boolean;
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
  id: number; fullName: string; phone?: string; email?: string;
  idCard?: string; nationality?: string; totalVisits: number;
  totalSpend: number; lastVisitDate?: string; isVip: boolean;
  avatar?: string; identityDocumentImage?: string; address?: string;
  preferRoomType?: string; preferVehicle?: string; notes?: string;
}

export interface HotelServiceDto {
  id: number; serviceCode: string; serviceName: string; category: string;
  subCategory?: string; unit?: string; unitPrice: number; description?: string;
  isAvailable: boolean; imageUrl?: string;
}

export interface HotelTourGuideDto {
  id: number; hotelCode: string; guideCode: string; name: string;
  phone?: string; email?: string; languages?: string; speciality?: string;
  isFreelance: boolean; dailyRate: number; bio?: string; imageUrl?: string;
  isActive: boolean;
  hrEmployeeId?: number; idCard?: string; address?: string;
  birthDate?: string; contractType: string; contractStatus?: string;
  contractFrom?: string; contractTo?: string; monthlyBaseSalary: number;
  totalTours: number; totalEarned: number; lastTourDate?: string; rating?: string;
}

export interface GuideContractDto {
  id: number; guideId: number; guideName: string; contractCode: string;
  contractType: string; startDate: string; endDate?: string;
  basicSalary: number; dailyRate: number; status: string;
  notes?: string; createdAt: string;
}

export interface GuideSalaryDto {
  id: number; guideId: number; guideName: string;
  month: number; year: number; tourCount: number;
  dailyRate: number; tourIncome: number; basicSalary: number;
  bonus: number; deductions: number; totalPay: number;
  status: string; paidAt?: string; notes?: string;
}

export interface DashboardData {
  checkInsToday: number; checkOutsToday: number;
  inHouse: number; todayRevenue: number;
}

export interface HotelAreaDto {
  id: number; hotelCode: string; parentId: number | null;
  areaCode?: string; areaName: string; areaType: string; color?: string;
  areaDescription?: string; roomCount?: number; sortOrder?: number; isActive: boolean;
  children?: HotelAreaDto[];
}

export interface HotelElementDto {
  id: number; hotelCode: string; areaId: number;
  name: string; type: string; capacity: number;
  status: string; // VC, VD, OC, OD, EA, ED, ED/EA
  color?: string; sortOrder: number; isActive: boolean;
}

export interface UpsertRoomRequest {
  id?: number;
  so: string;
  ma: string;
  ten?: string;
  floor?: string;
  khuVucCode?: string;
  areaId?: number | null;
  maxPerson?: number;
  basePrice?: number;
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
}

export interface RoomRackCell {
  date: string;
  status: string;
  bookingId?: number;
  bookingCode?: string;
  guestName?: string;
  guestPhone?: string;
  checkIn?: string;
  checkOut?: string;
  totalAmount?: number;
  paidAmount?: number;
  source?: string;
  blockType?: string;
  note?: string;
  isStart: boolean;
  isEnd: boolean;
  spanDays: number;
}

export interface RoomRackRoom {
  id: number;
  roomNo: string;
  roomType?: string;
  roomTypeName?: string;
  floor?: string;
  status: string;
  cells: RoomRackCell[];
}

export interface RoomRackData {
  fromDate: string;
  toDate: string;
  dates: { date: string; label: string; isToday: boolean; isWeekend: boolean }[];
  rooms: RoomRackRoom[];
}
