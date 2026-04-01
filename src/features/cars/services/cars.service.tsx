import api from "../../../core/services/api.service";
import type {
  CarPagingParams,
  CarPagingResponse,
  CarsListResponse,
  CreateResponse,
  CarFormValues,
  CarRequestPayload,
  GetCarByIDRespone,
  CarFieldSetup
} from "./cars.type";

// Helper: Build request payload từ CarFormValues
const buildCarPayload = (car: CarFormValues): CarRequestPayload => ({
  LicensePlates:    car.licensePlates,
  Note:             car.note             ?? null,
  Content:          car.content          ?? null,
  MileageAllowance: car.mileageAllowance  ?? 0,
  FuelAmount:       car.fuelAmount        ?? 0,
  Files:            car.files?.length ? car.files : null,
});

export const carService = {
  list: async (): Promise<CarsListResponse[]> => {
    const res = await api.get("/cars/list");
    return res.data;
  },

  getPaging: async (params: CarPagingParams): Promise<CarPagingResponse> => {
    const res = await api.get("/cars", { params });
    return res.data;
  },

  createCar: async (car: CarFormValues): Promise<CreateResponse> => {
    const res = await api.post("/cars", buildCarPayload(car));
    return res.data;
  },

  updateCar: async (id: string, car: CarFormValues): Promise<CreateResponse> => {
    const res = await api.put(`/cars/${id}`, buildCarPayload(car));
    return res.data;
  },

  deleteCar: async (id: string): Promise<CreateResponse> => {
    const res = await api.delete(`/cars/${id}`);
    return res.data;
  },

  getCarById: async (id: string): Promise<GetCarByIDRespone> => {
    const res = await api.get(`cars/${id}`);
    return res.data;
  },

  getCarFieldSetup: async(carId: string): Promise<CarFieldSetup[]> => {
    const res = await api.get(`cars/car-field-setup?carId=${carId}`);
    return res.data;
  },

  updateCarFieldSetup: async(carId: string, carFieldSetups: CarFieldSetup[]): Promise<{code: number}> => {
    const payload = carFieldSetups.map((s) => ({
      Id: 0,
      CarId: Number(carId),
      CarFieldId: s.carFieldId,
      ValueNumber: s.valueNumber ?? null,
      FromAt: s.fromAt ?? null,
      ToAt: s.toAt ?? null,
      WarningAt: s.warningAt ?? null,
      UserIdString: s.userIdString ?? null,
      Note: s.note ?? null,
      FileLink: s.fileLink ?? null,
    }));
    const res = await api.put(`cars/car-field-setup?carId=${carId}`, payload);
    return res.data;
  }
};