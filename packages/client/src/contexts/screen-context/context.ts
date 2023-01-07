import React from 'react';

interface ScreenContextInterface {
    isSmall: boolean;
    isMedium: boolean;
    isLarge: boolean;
}

const ScreenContext = React.createContext<ScreenContextInterface>(
    {} as ScreenContextInterface,
);

const useScreen = () => React.useContext(ScreenContext);

export { ScreenContext, useScreen };
