export interface CarsListResponse {
  id: string;
  licensePlates: string;
  note?: string;
}

export interface CarFileItem {
  fileName?: string;
  fileUrl?: string;
}

export interface CarResponse {
  id: string;
  licensePlates: string;
  note?: string;
  mileageAllowance?: number;
  fuelAmount?: number;
  content?: string;
  // BE trả về files là string[] (URL trực tiếp)
  files?: string[];
  // Giữ lại file?: CarFileItem[] để tương thích nếu có endpoint cũ
  file?: CarFileItem[];
}

export interface CarPagingResponse {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  data: CarResponse[];
}

export interface CarPagingParams {
  page: number;
  pageSize: number;
  searchText?: string;
}

export interface CreateResponse {
  code: number;
  message?: string;
}

export type CarFormValues = Omit<CarResponse, "id" | "file" | "files"> & {
  id?: string;
  files?: string[];
  existingFiles?: CarFileItem[];
};

export interface CarRequestPayload {
  LicensePlates: string;
  Note: string | null;
  Content: string | null;
  MileageAllowance: number;
  FuelAmount: number;
  Files: string[] | null;
}

export interface GetCarByIDRespone {
  car?: CarResponse;
  message?: string;
}

export interface CarFieldSetup {
  carFieldId: number;
  name: string;
  order: number;
  valueNumber? : number;
  fromAt?: Date;
  toAt?: Date;
  warningAt?: Date;
  userIdString?: string;
  note?: string;
  fileLink?: string
}