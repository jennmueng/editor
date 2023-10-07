export const fetchSuggestions = async (
    text: string,
    selectionStart: number,
    selectionEnd: number
) => {
    const withWrappedSelection = `${text.slice(0, selectionStart)}[${text.slice(
        selectionStart,
        selectionEnd
    )}]${text.slice(selectionEnd)}`;

    const response = await fetch("/api/rephrase", {
        method: "POST",
        body: JSON.stringify({ contextInput: withWrappedSelection }),
    });

    return response.json();
};
