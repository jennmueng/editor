import React from "react";
import { Spinner } from "./spinner";

interface PopupChildrenProps {
    isLoading: boolean;
    suggestions: string[];
}

export const PopupChildren = ({
    isLoading,
    suggestions,
}: PopupChildrenProps) => {
    const originalTextRef = React.useRef<string>();

    if (isLoading) {
        return <Spinner />;
    }

    if (suggestions.length > 0) {
        return (
            <>
                {suggestions.map((suggestion, index) => (
                    <div
                        key={index}
                        className="p-2 cursor-pointer hover:bg-gray-100 rounded text-xs pointer-events-auto select-none whitespace-nowrap"
                        onMouseEnter={(e) => {
                            const selection = window.getSelection();

                            if (selection && selection.rangeCount > 0) {
                                const range = selection.getRangeAt(0);

                                originalTextRef.current = range.toString();

                                const element = document.createElement("span");
                                element.className =
                                    "text-blue-700 font-semibold";
                                element.innerHTML = suggestion;
                                range.deleteContents();
                                range.insertNode(element);

                                range.commonAncestorContainer.normalize();
                            }
                        }}
                        onMouseLeave={() => {
                            const selection = window.getSelection();

                            if (selection && selection.rangeCount > 0) {
                                const range = selection.getRangeAt(0);

                                range.deleteContents();
                                range.insertNode(
                                    document.createTextNode(
                                        originalTextRef.current ?? ""
                                    )
                                );

                                range.commonAncestorContainer.normalize();
                            }
                        }}
                        onPointerUp={(e) => {
                            e.preventDefault();
                            e.stopPropagation();

                            const selection = window.getSelection();

                            if (selection && selection.rangeCount > 0) {
                                const range = selection.getRangeAt(0);
                                range.deleteContents();
                                range.insertNode(
                                    document.createTextNode(suggestion)
                                );

                                selection.removeAllRanges();

                                range.commonAncestorContainer.normalize();
                            }
                        }}
                    >
                        {suggestion}
                    </div>
                ))}
            </>
        );
    }

    return (
        <span className="text-xs text-gray-400 whitespace-nowrap">
            No suggestions found.
        </span>
    );
};
