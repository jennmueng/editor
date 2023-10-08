"use client";

import { autoUpdate, useFloating } from "@floating-ui/react";
import clsx from "clsx";

interface PopupProps {
    rect?: DOMRect | null;
    visible: boolean;
    children: React.ReactNode;
}

export const Popup = ({ rect, visible, children }: PopupProps) => {
    const { refs, floatingStyles } = useFloating({
        whileElementsMounted: autoUpdate,
        placement: "top",
    });

    if (!rect) {
        return null;
    }

    return (
        <div
            className={clsx(
                "absolute top-0 left-0 flex items-center justify-center pointer-events-none"
            )}
            ref={refs.setReference}
            style={{
                transform: `translate(${rect.x}px, ${rect.y}px)`,
                width: rect.width,
                height: rect.height,
            }}
        >
            {visible && (
                <div
                    ref={refs.setFloating}
                    style={floatingStyles}
                    className="flex-grow-0 flex-shrink"
                >
                    <div className="animate-in ease-in-out zoom-in-75 bg-white border rounded-md shadow-md p-1 flex flex-col flex-shrink  max-w-6xl pointer-events-auto">
                        {children}
                    </div>
                </div>
            )}
        </div>
    );
};
