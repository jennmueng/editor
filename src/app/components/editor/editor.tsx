"use client";

import Placeholder from "@tiptap/extension-placeholder";
import { EditorProvider } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import React from "react";

import { SelectionHighlightMark, TextReplacementExtension } from "./extensions";
import { Menu } from "./menu";
import { useSuggestions } from "./utils";

export const Editor = () => {
    const { suggestions, status, debouncedGetSuggestions, context, onBlur } =
        useSuggestions();

    return (
        <div className="relative">
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
                    const isSystemAction =
                        transaction.getMeta("isSystemAction");

                    if (!isSystemAction) {
                        debouncedGetSuggestions(editor, transaction);
                    }
                }}
            >
                <Menu
                    suggestions={suggestions}
                    context={context}
                    status={status}
                />
            </EditorProvider>
        </div>
    );
};
