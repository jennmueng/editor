import { posToDOMRect, useCurrentEditor } from "@tiptap/react";
import React from "react";

import { SelectionContext } from "~/app/types";

import { Popup } from "./popup";
import { Suggestions } from "./suggestions";

interface MenuProps {
    suggestions: string[];
    context: SelectionContext | null;
    status: "idle" | "fetching" | "done";
}

export const Menu = ({ suggestions, context, status }: MenuProps) => {
    const { editor } = useCurrentEditor();

    const lastRect = React.useRef<DOMRect | null>(null);

    const rect = React.useMemo(() => {
        if (!editor || status === "done") {
            return lastRect.current;
        }

        const rect = posToDOMRect(
            editor.view,
            editor.state.selection.from,
            editor.state.selection.to
        );

        lastRect.current = rect;

        return rect;
    }, [
        status,
        editor?.view,
        editor?.state.selection.from,
        editor?.state.selection.to,
    ]);

    if (!editor || editor.isDestroyed) {
        return null;
    }

    return (
        <Popup rect={rect} visible={status !== "idle"}>
            <Suggestions
                isLoading={status === "fetching" || status === "idle"}
                suggestions={suggestions}
                context={context}
            />
        </Popup>
    );
};
