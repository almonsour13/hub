import { format, isToday, isYesterday } from "date-fns";
export const formatMessageTime = (date: Date) => {
    const messageDate = new Date(date);
    if (isToday(messageDate)) {
        return format(messageDate, "HH:mm");
    } else if (isYesterday(messageDate)) {
        return `Yesterday ${format(messageDate, "HH:mm")}`;
    } else {
        return format(messageDate, "HH:mm a");
    }
};
