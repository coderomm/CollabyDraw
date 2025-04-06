'use client';

import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

type CodeBlockProps = {
    language: string;
    value: string;
};

const CodeBlock = ({ language, value }: CodeBlockProps) => {
    return (
        <SyntaxHighlighter
            style={oneLight}
            language={language}
            PreTag="div"
            wrapLongLines
        >
            {value}
        </SyntaxHighlighter>
    );
};

export default CodeBlock;
