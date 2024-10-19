import { SortOrder } from 'mongoose';
// input value resive interface
type IOptionPagination = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: SortOrder;
};

// return value interface
type IOptionReturn = {
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: SortOrder;
};

// pagination query if user send value Or by deafult resive value
const calculationPagination = (Option: IOptionPagination): IOptionReturn => {
  const page = Number(Option.page) || 1;
  const limit = Number(Option.limit) || 5;
  const skip = (page - 1) * limit;
  const sortBy = Option.sortBy || 'createdAt';
  const sortOrder: SortOrder = Option.sortOrder || 'desc';

  return {
    page,
    limit,
    skip,
    sortBy,
    sortOrder,
  };
};

export const HelperPagination = {
  calculationPagination,
};
