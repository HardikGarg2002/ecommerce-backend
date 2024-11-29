import moment from "moment";

export const endOfDay = (
    strDate: string,
    format: string = "YYYY-MM-DD"
): Date => {
    return moment(strDate, format).endOf("day").toDate();
};

export const startOfDay = (
    strDate: string,
    format: string = "YYYY-MM-DD"
): Date => {
    return moment(strDate, format).startOf("day").toDate();
};
