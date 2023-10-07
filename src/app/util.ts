export const fetchSuggestions = async (
    text: string,
    start: number,
    end: number
) => {
    const response = await fetch("/api/rephrase", {
        method: "POST",
        body: JSON.stringify({ text, start, end }),
    });

    return response.json();
};
