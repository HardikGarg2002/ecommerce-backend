import { IPagination } from "./pagination";
import { IUser } from "./user";

export interface IHsn {
    _id?: string;
    code: string;
    desc: string;
    gst: number;
    is_active?: boolean;
    created?:IUser;
    updated?:IUser;
}

export interface IHsnWithMeta {
    data: IHsn[],
    meta:{
        pagination:IPagination;
    }
}