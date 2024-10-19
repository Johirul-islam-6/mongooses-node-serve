// this is semester services pagination type
export type IPaginationOpton = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};
