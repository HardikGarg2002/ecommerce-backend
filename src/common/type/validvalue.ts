import { IPagination } from './pagination';
import { IUser } from './user';

export interface IValidvalue {
  _id?: string;
  type: string;
  label: string;
  values: IValue[];
  created_by?: string;
  updated_by?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface IValue {
  key?: string;
  label: string;
  sort?: number;
  is_active?: boolean;
}

export interface IValidvalueWithMeta {
  data: IValidvalue[];
  meta: {
    pagination: IPagination;
  };
}
