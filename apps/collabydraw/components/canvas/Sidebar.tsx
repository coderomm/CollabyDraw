import React from "react";
import { Separator } from "../ui/separator";
import { bgFill, ToolType, strokeFill, strokeWidth } from "@/types/canvas";

interface SidebarProps {
    activeTool: ToolType;
    strokeFill: strokeFill;
    setStrokeFill: React.Dispatch<React.SetStateAction<strokeFill>>;
    strokeWidth: strokeWidth;
    setStrokeWidth: React.Dispatch<React.SetStateAction<strokeWidth>>;
    bgFill: bgFill;
    setBgFill: React.Dispatch<React.SetStateAction<bgFill>>;
}

export const Sidebar = ({
    activeTool,
    strokeFill,
    setStrokeFill,
    setStrokeWidth,
    bgFill,
    setBgFill,
}: SidebarProps) => {
    const strokeFills: strokeFill[] = [
        "rgba(211, 211, 211)",
        "rgba(242, 154, 158)",
        "rgba(77, 161, 83)",
        "rgba(98, 177, 247)",
        "rgba(183, 98, 42)",
    ];

    const strokeWidths: strokeWidth[] = [1, 2, 4]

    const bgFills: bgFill[] = [
        "rgba(0, 0, 0, 0)",
        "rgba(89, 49, 49)",
        "rgba(23, 61, 16)",
        "rgba(30, 70, 101)",
        "rgba(49, 37, 7)",
    ];

    if (activeTool === "eraser" || activeTool === "grab") {
        return;
    }

    return (
        <div className="fixed left-10 top-[50%] bg-[#232329] px-2 py-4 rounded-md -translate-y-[50%] w-fit h-1/2 text-white">
            <div className="flex flex-col gap-2 justify-start items-start w-full h-full">
                <div>
                    <p className="text-sm text-white/70 mb-1">Stroke</p>
                    <div className="flex gap-2 h-7 items-center">
                        {strokeFills.map((fill, index) => (
                            <ColorFillIndicator
                                key={index}
                                color={fill}
                                onClick={() => setStrokeFill(fill)}
                            />
                        ))}

                        <Separator orientation="vertical" className="bg-white/20 mx-2" />

                        <ColorFillIndicator color={strokeFill} />


                    </div>
                </div>

                <div>
                    <p className="text-sm text-white/70 mb-1">Background Color</p>
                    <div className="flex gap-2 h-7 items-center">
                        {bgFills.map((fill, index) => (
                            <ColorBgIndicator
                                key={index}
                                color={fill}
                                onClick={() => setBgFill(fill)}
                            />
                        ))}

                        <Separator orientation="vertical" className="bg-white/20 mx-2" />

                        <ColorBgIndicator color={bgFill} />

                    </div>
                </div>


                <div>
                    <p className="text-sm text-white/70 mb-1">Stroke Width</p>
                    <div className="flex gap-2 h-7 items-center">
                        {strokeWidths.map((strokeWidth, index) => (
                            <StrokeWidthIndicator
                                key={index}
                                strokeWidth={strokeWidth}
                                onClick={() => setStrokeWidth(strokeWidth)}
                            />
                        ))}

                    </div>
                </div>
            </div>
        </div>
    );
};

const ColorFillIndicator = ({
    color,
    onClick,
}: {
    color: strokeFill;
    onClick?: () => void;
}) => {
    return (
        <div
            className="w-[1.4rem] h-[1.4rem] rounded-sm cursor-pointer hover:border border-white/70 transition-all"
            style={{ backgroundColor: color }}
            onClick={onClick}
        >

        </div>
    );
};

const ColorBgIndicator = ({
    color,
    onClick,
}: {
    color: bgFill;
    onClick?: () => void;
}) => {
    return (
        <div
            className={"w-[1.4rem] h-[1.4rem] rounded-sm cursor-pointer hover:border border-white/70 transition-all " + `${color === "rgba(0, 0, 0, 0)" ? "border border-white/30" : ""}`}
            style={{ backgroundColor: color }}
            onClick={onClick}
        ></div>
    );
};


const StrokeWidthIndicator = ({ strokeWidth, onClick }: { strokeWidth: strokeWidth, onClick?: () => void }) => {
    return <div
        className={"w-[1.4rem] h-[1.4rem] rounded-sm cursor-pointer hover:border-white-70 border-white/10 border transition-all flex items-center"}
        onClick={onClick}
    >
        <div
            style={{ height: `${strokeWidth}px` }}
            className="w-full bg-white/80"
        />
    </div>
}