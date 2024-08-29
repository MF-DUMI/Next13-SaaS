"use client";

import { useEffect } from "react";
import { Crisp } from "crisp-sdk-web";


export const CrispChat = () => {
    useEffect(() => {
        Crisp.configure("87835149-2061-4f94-b5f0-ef47038f6969");
    }, []);

    return null;
}
 
