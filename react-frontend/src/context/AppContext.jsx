import { baseURL } from "../utils/config";
import React, { createContext, useContext, useState, useEffect } from "react";


export const AppContext = createContext();

const ContextProvider = (props) => {
    return (
        <AppContext.Provider value={{ baseURL }}>
            {props.children}
        </AppContext.Provider>
    );
}

export default ContextProvider;