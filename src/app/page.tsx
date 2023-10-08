import { Editor } from "./components";

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-between pt-48">
            <div className="container border border-gray-200 rounded-lg shadow-sm">
                <Editor />
            </div>
        </main>
    );
}
