import Image from "next/image";

import { Editor } from "./components";

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col">
            <div className="container flex flex-col pt-48 mx-auto gap-8">
                <div className="px-2 mx-auto flex flex-col items-center gap-2">
                    <div className="flex flex-row items-center gap-1 -ml-2">
                        <Image
                            width={36}
                            height={36}
                            src="/magic-pen-icon.png"
                            alt="Magic editor icon"
                        />
                        <h1 className="text-2xl font-semibold">Magic Editor</h1>
                    </div>
                    <span className="text-sm text-gray-400 tracking-normal">
                        Select any text to trigger suggestions
                    </span>
                </div>
                <div className="border border-gray-200 rounded-lg shadow-sm">
                    <Editor />
                </div>
            </div>
        </main>
    );
}
