export interface Good {
    id: number;
    menuType?: string;
    account?: string;
    accountName?: string;
    warehouse?: string;
    warehouseName?: string;
    detail1?: string;
    detail2?: string;
    detailName1?: string;
    detailName2?: string;
    goodsType?: string;
    image1?: string;
    quantity: number;
    quantityInput?: number;
    status: number;
    priceList?: string;
    order?: number;
    orginalVoucherNumber?: string;
    ledgerId?: number;
    qrCode?: string;
    goodCode: string; // Computed or Detail2/Detail1
    goodName: string; // Computed or DetailName2/DetailName1
    note?: string;
    dateExpiration?: string;
    dateManufacture?: string;
    isPrinted?: boolean;
}

export interface GoodsSearchParam {
    searchText?: string;
    goodType?: string;
    account?: string;
    detail1?: string;
    priceCode?: string;
    menuType?: string;
    warehouse?: string;
    goodCode?: string;
    status?: number;
    page: number;
    pageSize: number;
}
