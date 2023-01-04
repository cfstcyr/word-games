import { AxiosInstance } from 'axios';
import React from 'react';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ApiContextInterface extends AxiosInstance {}

const ApiContext = React.createContext<ApiContextInterface>(
    {} as ApiContextInterface,
);

const useApi = (): ApiContextInterface => React.useContext(ApiContext);

export { ApiContext, useApi };
