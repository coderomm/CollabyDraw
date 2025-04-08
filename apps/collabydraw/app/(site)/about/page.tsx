import React from "react";

export default function AboutPage() {
    return (
        <div className="space-y-xl bg-page-gradient-purple py-40">
            <section className="container max-w-screen-md space-y-sm text-color-primary-text">
                <h1 className="text-4xl sm:text-4xl lg:text-6xl font-semibold mb-6 text-center font-assistant">
                    About CollabyDraw
                </h1>

                <div className="prose prose-invert prose-headings:text-white prose-a:text-blue-400 prose-strong:text-white prose-code:text-pink-400 max-w-none lg:text-xl">
                    <p>
                        <strong>CollabyDraw</strong> is a web-based collaborative whiteboard
                        where multiple users can draw, edit, and brainstorm together in real
                        time. Whether solo or in a group session, the app offers a smooth,
                        intuitive canvas experience with real-time sync, shape tools, editable
                        text, and privacy-focused end-to-end encryption — all without needing
                        an account.
                    </p>

                    <h3 className="mt-3 mb-1 lg:mt-8 lg:mb-2">✅ Core Features</h3>
                    <ul className="flex flex-col gap-1">
                        <li><strong>Canvas Drawing:</strong> Freehand, shapes, and editable text</li>
                        <li><strong>Rough.js Support:</strong> Optional sketch-style drawing</li>
                        <li><strong>Perfect-freehand Support:</strong> Hand drawn feel</li>
                        <li><strong>Eraser Tool:</strong> Remove individual shapes</li>
                        <li><strong>Editable Text:</strong> Double-click to edit on canvas</li>
                    </ul>

                    <h3 className="mt-3 mb-1 lg:mt-8 lg:mb-2">🔗 Collaboration</h3>
                    <ul className="flex flex-col gap-1">
                        <li><strong>Real-time Sync:</strong> WebSocket-powered live drawing</li>
                        <li><strong>Multi-Tab Awareness:</strong> No duplicate join/leave events</li>
                        <li><strong>Optimistic Updates:</strong> Instant feedback before server response</li>
                    </ul>

                    <h3 className="mt-3 mb-1 lg:mt-8 lg:mb-2">🔐 Privacy & End-to-End Encryption (E2EE)</h3>
                    <p>
                        CollabyDraw is built with <strong>privacy by design</strong> to ensure
                        that no sensitive drawing data can be accessed by anyone other than the
                        intended participants.
                    </p>

                    <h4 className="mt-3 mb-1 lg:mt-8 lg:mb-2">🔑 How It Works</h4>
                    <pre>
                        <code>https://collabydraw.app/#room=abc123,xyz456</code>
                    </pre>
                    <ul className="flex flex-col gap-1">
                        <li><code>abc123</code>: Unique room ID (used by the server)</li>
                        <li><code>xyz456</code>: Encryption key (used <strong>only</strong> on the client)</li>
                    </ul>

                    <h4 className="mt-3 mb-1 lg:mt-8 lg:mb-2">🧠 Key Never Touches the Server</h4>
                    <ul className="flex flex-col gap-1">
                        <li>
                            The <strong>encryption key</strong> after the comma (<code>xyz456</code>) is part
                            of the URL fragment (<code>#...</code>)
                        </li>
                        <li>This fragment is <strong>never sent</strong> in HTTP requests</li>
                    </ul>
                    <blockquote>
                        The server cannot see or store the encryption key.
                    </blockquote>

                    <h4 className="mt-3 mb-1 lg:mt-8 lg:mb-2">🔒 Client-Side Only Decryption</h4>
                    <ul className="flex flex-col gap-1">
                        <li>All encrypted drawing data is transmitted over WebSocket</li>
                        <li>
                            The <strong>decryption and rendering</strong> happen completely on the
                            client-side using the key from the URL
                        </li>
                        <li>
                            Even if someone intercepts the WebSocket traffic, they cannot decrypt
                            the data without the key
                        </li>
                    </ul>

                    <h4 className="mt-3 mb-1 lg:mt-8 lg:mb-2">🛡️ Benefits</h4>
                    <ul className="flex flex-col gap-1">
                        <li>No one — not even the server — can read what’s drawn without the key</li>
                        <li>Ensures <strong>confidentiality</strong> for private sessions</li>
                        <li>
                            Works like <strong>Collabydraw&apos;s E2EE rooms</strong>, but tailored for your logic
                        </li>
                    </ul>

                    <h3 className="mt-3 mb-1 lg:mt-8 lg:mb-2">🧠 Reliability</h3>
                    <ul className="flex flex-col gap-1">
                        <li><strong>Message Queue:</strong> Stores unsent messages in memory/localStorage</li>
                        <li><strong>Auto Retry:</strong> Flushes queued messages on reconnect</li>
                    </ul>

                    <h3 className="mt-3 mb-1 lg:mt-8 lg:mb-2">🧭 Modes</h3>
                    <ul className="flex flex-col gap-1">
                        <li><strong>Standalone Mode:</strong> Offline/local drawing</li>
                        <li><strong>Room Mode:</strong> Collaborative sessions</li>
                    </ul>

                    <h3 className="mt-3 mb-1 lg:mt-8 lg:mb-2">⚙️ Tech Stack</h3>
                    <ul className="flex flex-col gap-1">
                        <li><strong>Frontend:</strong> React (Vite), TypeScript, Tailwind CSS</li>
                        <li><strong>Canvas:</strong> HTML Canvas API + Custom Engine</li>
                        <li><strong>Realtime:</strong> Native WebSocket (<code>useWebSocket</code> hook)</li>
                        <li><strong>Security:</strong> Hash-based E2EE</li>
                    </ul>

                    <h3 className="mt-3 mb-1 lg:mt-8 lg:mb-2">📂 Github Repo</h3>
                    <p>
                        <a href="https://github.com/coderomm/CollabyDraw" target="_blank" rel="noopener noreferrer">
                            github.com/coderomm/CollabyDraw
                        </a>
                    </p>

                    <h3 className="mt-3 mb-1 lg:mt-8 lg:mb-2">📽️ YouTube Demo</h3>
                    <div className="aspect-w-16 aspect-h-9 mb-4">
                        <iframe
                            className="w-full h-full rounded-md"
                            src="https://www.youtube.com/embed/NNVdRCoFnK0"
                            title="YouTube demo"
                            frameBorder="0"
                            allowFullScreen
                        ></iframe>
                    </div>

                    <h3 className="mt-3 mb-1 lg:mt-8 lg:mb-2">🐦 Tweet Embed</h3>
                    <a href="https://twitter.com/coder_om/status/1711737824058880576"></a>
                </div>
            </section>
        </div>
    );
}
