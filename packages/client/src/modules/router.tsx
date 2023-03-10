import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { IndexPage } from '../pages/index-page/index-page';
import { LetterBoxedGame } from '../pages/letter-boxed/letter-boxed';
import { SpellingBeeGame } from '../pages/spelling-bee/spelling-bee';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <IndexPage />,
    },

    {
        path: '/spelling-bee/game',
        element: <SpellingBeeGame />,
    },
    {
        path: '/spelling-bee/practice',
        element: <SpellingBeeGame isPractice />,
    },

    {
        path: '/letter-boxed/game',
        element: <LetterBoxedGame />,
    },
    {
        path: '/letter-boxed/practice',
        element: <LetterBoxedGame isPractice />,
    },
]);
