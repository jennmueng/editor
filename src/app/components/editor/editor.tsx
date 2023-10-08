"use client";

import { useSuggestions } from "./utils";

import { EditorProvider } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { SelectionHighlightMark, TextReplacementExtension } from "./extensions";

import React from "react";
import { Menu } from "./menu";
import Placeholder from "@tiptap/extension-placeholder";
import HardBreak from "@tiptap/extension-hard-break";

export const Editor = () => {
    const { suggestions, status, debouncedGetSuggestions, context, onBlur } =
        useSuggestions();

    const shouldUpdate = React.useCallback(() => {
        return status === "idle";
    }, [status]);

    return (
        <EditorProvider
            extensions={[
                StarterKit,
                SelectionHighlightMark,
                TextReplacementExtension,
                Placeholder.configure({
                    placeholder: "Start typing the next big thing...",
                }),
                // HardBreak.extend({
                //     addKeyboardShortcuts() {
                //         return {
                //             Enter: () => this.editor.commands.setHardBreak(),
                //         };
                //     },
                // }).configure({
                //     keepMarks: false,
                // }),
            ]}
            editorProps={{
                attributes: {
                    class: "prose !outline-none p-4",
                },
            }}
            onBlur={onBlur}
            onSelectionUpdate={({ editor, transaction }) => {
                debouncedGetSuggestions(editor, transaction);
            }}
        >
            <Menu suggestions={suggestions} context={context} status={status} />
        </EditorProvider>
    );
};
