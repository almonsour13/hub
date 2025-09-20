import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Attachment } from "@/store/use-chat-messages";
import Image from "next/image";


interface ShowImageModalProps {
    attachment: Attachment;
}
export function ShowImageModal({attachment}: ShowImageModalProps) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <div className="group relative cursor-pointer overflow-hidden rounded border">
                    <Image
                        src={attachment.url}
                        alt={attachment.name}
                        className="max-h-32 w-auto object-cover"
                    />
                    <div className="absolute inset-0 z-10 hidden bg-black/30 group-hover:block"></div>
                </div>
            </DialogTrigger>
            <DialogContent className="p-0 border-none">
                <Image
                    src={attachment.url}
                    alt={attachment.name}
                    className="max-h-[80vh] w-auto mx-auto rounded object-contain"
                />
            </DialogContent>
        </Dialog>
    );
}
