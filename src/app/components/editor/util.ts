import { Node } from "@tiptap/pm/model";
import { SelectionContext } from "~/app/types";
import React from "react";
import { useDebouncedCallback } from "use-debounce";
import { Editor as IEditor } from "@tiptap/core";
import { Transaction } from "@tiptap/pm/state";

export const fetchSuggestions = async (context: SelectionContext) => {
    const response = await fetch("/api/rephrase", {
        method: "POST",
        body: JSON.stringify(context),
    });

    return response.json() as Promise<string[]>;
};

const CONTEXT_PADDING_CHARS = 64;

export const getSelectionContext = (
    doc: Node,
    selectionStart: number,
    selectionEnd: number
) => {
    let contextStart = Math.max(0, selectionStart - CONTEXT_PADDING_CHARS);
    let contextEnd = Math.min(
        selectionEnd + CONTEXT_PADDING_CHARS,
        doc.content.size
    );

    const wordBoundaryRegex = /[\s\(\)\[\]\.,;:!?]/;
    const textBeforeSelection = doc.cut(
        contextStart,
        selectionStart
    ).textContent;
    const reversedTextBeforeSelection = textBeforeSelection
        .split("")
        .reverse()
        .join("");
    let wordBoundaryBefore =
        reversedTextBeforeSelection.search(wordBoundaryRegex);
    if (wordBoundaryBefore === -1) {
        wordBoundaryBefore = reversedTextBeforeSelection.length;
    }
    const textAfterSelection = doc.cut(selectionEnd, contextEnd).textContent;
    let wordBoundaryAfter = textAfterSelection.search(wordBoundaryRegex);
    if (wordBoundaryAfter === -1) {
        wordBoundaryAfter = textAfterSelection.length;
    }

    selectionStart -= wordBoundaryBefore;
    selectionEnd += wordBoundaryAfter;

    const context: SelectionContext = {
        before: doc.cut(contextStart, selectionStart).textContent,
        selection: doc.cut(selectionStart, selectionEnd).textContent,
        after: doc.cut(selectionEnd, contextEnd).textContent,
        selectionStart,
        selectionEnd,
    };

    return context;
};

export const useSuggestions = () => {
    const [context, setContext] = React.useState<SelectionContext | null>(null);
    const [suggestions, setSuggestions] = React.useState<string[]>([]);
    const [status, setStatus] = React.useState<"idle" | "fetching" | "done">(
        "idle"
    );

    const transactionRef = React.useRef<number>(0);

    const onBlur = React.useCallback(() => {
        setSuggestions([]);
        setStatus("idle");
        setContext(null);
    }, []);

    const debouncedGetSuggestions = useDebouncedCallback(
        async (editor: IEditor, transaction: Transaction) => {
            const context = getSelectionContext(
                editor.state.doc,
                transaction.selection.from,
                transaction.selection.to
            );

            setContext(context);
            setStatus("fetching");

            const transactionId = Date.now();
            transactionRef.current = transactionId;

            const suggestions = await fetchSuggestions(context);

            if (transactionId === transactionRef.current) {
                setSuggestions(suggestions);
                setStatus("done");
            }
        },
        250
    );

    const getSuggestionsHandler = React.useCallback(
        (editor: IEditor, transaction: Transaction) => {
            if (transaction.selection.empty) {
                setSuggestions([]);
                setStatus("idle");
                setContext(null);
            } else if (status === "idle") {
                debouncedGetSuggestions(editor, transaction);
            }
        },
        [debouncedGetSuggestions, status]
    );

    return {
        context,
        suggestions,
        status,
        debouncedGetSuggestions: getSuggestionsHandler,
        onBlur,
    };
};
