import { Mark, Commands, getMarkType, Extension } from "@tiptap/core";

declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        selectionHighlight: {
            setSelectionHighlight: (from: number, to: number) => ReturnType;
            unsetSelectionHighlight: () => ReturnType;
        };

        textReplacement: {
            previewText: (text: string) => ReturnType;
            revertText: () => ReturnType;
            setText: (text: string) => ReturnType;
        };
    }
}

export const TextReplacementExtension = Extension.create({
    name: "textReplacement",
    addCommands() {
        let originalText: string = "";
        let replacedText: string = "";

        return {
            setText:
                (text: string) =>
                ({ tr, state, commands }) => {
                    tr.replaceSelectionWith(tr.doc.type.schema.text(text));
                    commands.setTextSelection({
                        from: state.selection.from,
                        to: state.selection.from + text.length,
                    });

                    return true;
                },
            previewText:
                (text: string) =>
                ({ tr, state, commands }) => {
                    originalText = tr.doc.textBetween(
                        state.selection.from,
                        state.selection.to,
                        "\n"
                    );

                    replacedText = text;

                    commands.setText(text);

                    return true;
                },
            revertText:
                () =>
                ({ tr, state, commands }) => {
                    tr.replaceSelectionWith(
                        tr.doc.type.schema.text(originalText)
                    );
                    commands.setTextSelection({
                        from: state.selection.from,
                        to: state.selection.from + originalText.length,
                    });

                    originalText = "";
                    replacedText = "";

                    return true;
                },
        };
    },
});

export const SelectionHighlightMark = Mark.create({
    name: "selectionHighlight",

    addCommands() {
        let marks: { from: number; to: number }[] = [];

        return {
            setSelectionHighlight:
                (from: number, to: number) =>
                ({ tr, state }) => {
                    const type = getMarkType(
                        "selectionHighlight",
                        state.schema
                    );
                    tr.addMark(from, to, type.create());

                    marks.push({ from, to });

                    return true;
                },
            unsetSelectionHighlight:
                () =>
                ({ tr, state, commands }) => {
                    marks.forEach((mark) => {
                        try {
                            tr.removeMark(
                                mark.from,
                                mark.to,
                                getMarkType("selectionHighlight", state.schema)
                            );
                        } catch (e) {}
                    });
                    marks = [];
                    return true;
                },
        };
    },

    renderHTML() {
        return ["span", { class: "bg-violet-100 rounded-sm" }, 0];
    },
});
