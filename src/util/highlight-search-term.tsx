export const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;

    const regex = new RegExp(
        `(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
        "gi"
    );
    const parts = text.split(regex);

    return parts.map((part, index) =>
        regex.test(part) ? (
            <span key={index} className="bg-primary text-primary-foreground">
                {part}
            </span>
        ) : (
            part
        )
    );
};
