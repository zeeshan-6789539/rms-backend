export interface IDemoProductBlueprint {
  name: string;
  sellPrice: number;
  purchasePrice: number;
  initialStock: number;
}

export interface IDemoSubcategoryBlueprint {
  name: string;
  products: IDemoProductBlueprint[];
}

export interface IDemoCategoryBlueprint {
  name: string;
  subcategories: IDemoSubcategoryBlueprint[];
}

export interface IDemoCompanyBlueprint {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  categories: IDemoCategoryBlueprint[];
}
