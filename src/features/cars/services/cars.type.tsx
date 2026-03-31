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

export type CarFormValues = Omit<CarResponse, "id" | "file"> & {
  id?: string;
  // files: base64 string[] gửi lên BE (đã convert từ File)
  files?: string[];
  // existingFiles: ảnh cũ giữ lại (base64 url từ server)
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