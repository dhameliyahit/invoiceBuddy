import React from "react";
import { Loader as LoaderIcon } from "lucide-react";

const Loader = ({ size = 60, color = "blue", text }) => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-transparent backdrop-blur-md z-50">
            <div className="flex flex-col items-center">
                <LoaderIcon
                    className="animate-spin"
                    size={size}
                    color={color}
                />
                {text && <p className="mt-4 text-2xl">{text}</p>}
            </div>
        </div>
    );
};

export default Loader;
