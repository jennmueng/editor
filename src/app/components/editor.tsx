"use client";

import React from "react";
import { fetchSuggestions } from "../util";
import { Popup } from "./popup";
import { Spinner } from "./spinner";

export const Editor = () => {
    const [hasSelection, setHasSelection] = React.useState(false);
    const [selectionRect, setSelectionRect] = React.useState<DOMRect>();

    const [suggestions, setSuggestions] = React.useState<string[]>([]);

    const contentEditableRef = React.useRef<HTMLDivElement>(null);
    const originalTextRef = React.useRef<string>();

    React.useEffect(() => {
        const handleSelectionChange = () => {
            const selection = window.getSelection();

            if (selection && selection.rangeCount !== 0) {
                if (
                    contentEditableRef.current?.contains(selection.anchorNode)
                ) {
                    const range = selection.getRangeAt(0);

                    if (range.startOffset !== range.endOffset) {
                        const rect =
                            contentEditableRef.current?.getBoundingClientRect();

                        if (rect) {
                            // Get the bounding rectangle of the range

                            const childNodes = [
                                ...Array.from(range.cloneContents().childNodes),
                            ];

                            const clientRects = range.getClientRects();

                            const nodes = Array.from(childNodes).flatMap(
                                (node, index) => {
                                    console.log(
                                        node.textContent,
                                        index,
                                        clientRects.item(index)?.toJSON()
                                    );
                                    if (
                                        node.textContent &&
                                        node.textContent?.trim() !== ""
                                    ) {
                                        const rect = clientRects
                                            .item(index)
                                            ?.toJSON();

                                        return rect ? [rect] : [];
                                    }

                                    return [];
                                }
                            );

                            const minX =
                                Math.min(...nodes.map((node) => node.left)) -
                                rect.left;
                            const minY =
                                Math.min(...nodes.map((node) => node.top)) -
                                rect.top;
                            const maxX =
                                Math.max(...nodes.map((node) => node.right)) -
                                rect.left;
                            const maxY =
                                Math.max(...nodes.map((node) => node.bottom)) -
                                rect.top;

                            const boundingRect = range
                                .getBoundingClientRect()
                                .toJSON();

                            setSelectionRect({
                                ...range.getBoundingClientRect().toJSON(),
                                x: boundingRect.x - rect.left,
                                y: boundingRect.y - rect.top,
                            });

                            // const x =
                            //     selectionRect.left +
                            //     selectionRect.width / 2 -
                            //     rect.left;
                            // const y = selectionRect.top - rect.top;

                            // setPopupX(x);
                            // setPopupY(y);
                            setHasSelection(true);

                            return;
                        }
                    }
                }
            }

            setHasSelection(false);
            setSuggestions([]);
        };

        document.addEventListener("selectionchange", handleSelectionChange);

        return () => {
            document.removeEventListener(
                "selectionchange",
                handleSelectionChange
            );
        };
    }, []);

    React.useEffect(() => {
        const handleSelectionJump = () => {
            const selection = window.getSelection();

            if (
                selection &&
                selection.rangeCount !== 0 &&
                contentEditableRef.current?.contains(selection.anchorNode)
            ) {
                const range = selection.getRangeAt(0);

                let start = range.startOffset;
                let end = range.endOffset;

                if (start !== end) {
                    const startTextContent = range.startContainer.textContent;

                    const endTextContent = range.endContainer.textContent;

                    if (startTextContent && endTextContent) {
                        while (
                            start > 0 &&
                            startTextContent[start - 1] !== " "
                        ) {
                            start--;
                        }

                        while (
                            end < endTextContent.length &&
                            endTextContent[end] !== " "
                        ) {
                            end++;
                        }

                        const rect =
                            contentEditableRef.current?.getBoundingClientRect();

                        if (rect) {
                            // Create a range from the contentEditable's selection
                            const newRange = document.createRange();
                            const startContainer = range.startContainer;
                            const endContainer = range.endContainer;

                            if (!startContainer || !endContainer)
                                return setHasSelection(false);

                            newRange.setStart(startContainer, start);
                            newRange.setEnd(endContainer, end);

                            selection.removeAllRanges();
                            selection.addRange(newRange);

                            const fetchSuggestionsHandler = async () => {
                                const text = selection.anchorNode?.textContent;

                                if (text) {
                                    setSuggestions([]);
                                    const suggestions = await fetchSuggestions(
                                        text,
                                        newRange.startOffset,
                                        newRange.endOffset
                                    );

                                    setSuggestions(suggestions);
                                }
                            };

                            fetchSuggestionsHandler();
                        }
                    }
                }
            }
        };

        document.addEventListener("pointerup", handleSelectionJump);

        return () => {
            document.removeEventListener("pointerup", handleSelectionJump);
        };
    }, []);

    return (
        <div className="relative bg-gray-50 rounded-md border border-gray-100 w-full">
            <div
                className="flex flex-col items-start p-3 w-full bg-transparent resize-none outline-none [&>div]:min-w-[1em] cursor-text"
                ref={contentEditableRef}
                contentEditable
            />
            <Popup rect={selectionRect} visible={hasSelection}>
                {suggestions.length === 0 ? (
                    <Spinner />
                ) : (
                    suggestions.map((suggestion, index) => (
                        <div
                            key={index}
                            className="p-2 cursor-pointer hover:bg-gray-100 rounded text-xs pointer-events-auto select-none whitespace-nowrap"
                            onMouseEnter={(e) => {
                                const selection = window.getSelection();

                                if (selection && selection.rangeCount > 0) {
                                    const range = selection.getRangeAt(0);

                                    originalTextRef.current = range.toString();

                                    const element =
                                        document.createElement("span");
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
                    ))
                )}
            </Popup>
        </div>
    );
};