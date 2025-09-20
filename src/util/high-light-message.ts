export const highlightMessage = (messageId: string) => {
    const element = document.getElementById(messageId);
    if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.classList.add(
            "ring-2",
            "ring-primary",
            "bg-primary/10",
            "transition-colors"
        );
        setTimeout(() => {
            element.classList.remove(
                "ring-2",
                "ring-primary",
                "bg-primary/10",
                "transition-colors"
            );
        }, 2000);
    }
};
