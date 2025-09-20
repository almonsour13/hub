import { format, isToday, isYesterday } from "date-fns";
export default function MessageDateSeperator({ date }: { date: string }) {
    const getDateLabel = (date: string) => {
        const messageDate = new Date(date);
        if (isToday(messageDate)) return "Today";
        if (isYesterday(messageDate)) return "Yesterday";
        return format(messageDate, "MMMM d, yyyy");
    };
    return (
        <div className="flex items-center justify-center my-8 px-18">
            <div className="flex items-center space-x-6 w-full">
                <div className="flex-1 h-px border-t"></div>
                <div className="px-4 py-1 bg-accent border rounded-full">
                    <time className="text-xs font-medium">
                        {getDateLabel(date)}
                    </time>
                </div>
                <div className="flex-1 h-px border-t"></div>
            </div>
        </div>
    );
}
