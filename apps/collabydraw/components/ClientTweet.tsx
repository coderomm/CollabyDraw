'use client';

import React from 'react';
import TweetEmbed from 'react-tweet-embed';

export default function ClientTweet() {
    return (
        <div className="my-6">
            <TweetEmbed tweetId="1711737824058880576" options={{ width: '100%' }} />
        </div>
    );
}
