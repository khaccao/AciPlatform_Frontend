export interface Car {
    id: number;
    licensePlates: string;
    note: string;
    content?: string;
    mileageAllowance: number;
    fuelAmount: number;
    files?: string[];
}

export interface RoadRoute {
    id: number;
    code: string;
    name: string;
    roadRouteDetail: string;
    policeCheckPointIdStr: string;
    numberOfTrips: number;
}

export interface DriverRouter {
    id: number;
    date: string;
    amount: number;
    note: string;
    status: string;
    petrolConsumptionId: number;
    advancePaymentAmount: number;
    fuelAmount: number;
    roadRouteName?: string;
    licensePlates?: string;
    driver?: string;
    kmFrom?: number;
    kmTo?: number;
}

export interface PetrolConsumption {
    id: number;
    date: string;
    userId: number;
    carId: number;
    petroPrice: number;
    kmFrom: number;
    kmTo: number;
    locationFrom: string;
    locationTo: string;
    advanceAmount: number;
    note: string;
    roadRouteId?: number;
}

export interface FleetFilterParams {
    pageNumber?: number;
    pageSize?: number;
    searchTerm?: string;
    fromDate?: string;
    toDate?: string;
}
