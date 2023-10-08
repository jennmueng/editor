"use client";

import { useSuggestions } from "./util";

import { EditorProvider } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { SelectionHighlightMark, TextReplacementExtension } from "./extensions";

import React from "react";
import { Menu } from "./menu";

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
            ]}
            content="<p>If debugging is the process of removing bugs, then programming must be the process of putting them in. (Edsger W. Dijkstra) A programmer is a person who passes as an exacting expert on the basis of being able to turn out, after innumerable punching, an infinite series of incomprehensive answers calculated with micrometric precisions from vague assumptions based on debatable figures taken from inconclusive documents and carried out on instruments of problematical accuracy by persons of dubious reliability and questionable mentality for the avowed purpose of annoying and confounding a hopelessly defenseless department that was unfortunate enough to ask for the information in the first place. (IEEE Grid newsmagazine) There is no programming language–no matter how structured–that will prevent programmers from making bad programs. (Larry Flon) The only people who have anything to fear from free software are those whose products are worth even less. (David Emery)

            </p>"
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
