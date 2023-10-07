import React from "react";
import { Editor } from "./components/editor";

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-between pt-48">
            <div className="container p-4 border border-gray-200 rounded-lg shadow-sm">
                <Editor />
            </div>
        </main>
    );
}
