import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import markdown from '@/content/detailsContent';
import ClientTweet from '@/components/ClientTweet';
// import dynamic from 'next/dynamic';
import { type Components } from 'react-markdown';
import CodeBlock from './CodeBlock';

// const CodeBlock = dynamic(() => import('./CodeBlock'), { ssr: false }); // 💡 Important: no SSR

export default function DetailsPage() {
    return (
        <div className="px-4 py-10 md:px-8 max-w-4xl mx-auto prose prose-lg">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                    code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                            <CodeBlock language={match[1]} value={String(children).replace(/\n$/, '')} />
                        ) : (
                            <code className="bg-gray-100 px-1 py-0.5 rounded" {...props}>{children}</code>
                        );
                    },
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    iframe({ node, ...props }) {
                        return (
                            <div className="aspect-video w-full my-6">
                                <iframe {...props} className="w-full h-full rounded-md" />
                            </div>
                        );
                    },
                }}
            >
                {markdown}
            </ReactMarkdown>

            <ClientTweet />
        </div>
    );
}