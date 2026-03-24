export interface CarsListResponse {
  id: string;
  licensePlates: string;
  note?: string 
}

export interface CarResponse {
  id: string;
  licensePlates: string;
  note?: string;
  mileageAllowance?: number;
  fuelAmount?: number;
  content?: string;
  file?: [{
    fileName?: string;
    fileUrl?: string
  }]
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
  message?: string
}