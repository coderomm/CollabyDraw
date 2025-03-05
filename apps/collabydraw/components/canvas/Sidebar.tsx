import React from "react";
import { Separator } from "../ui/separator";
import { ToolType, StrokeFill, StrokeWidth, BgFill } from "@/types/canvas";

interface SidebarProps {
    activeTool: ToolType;
    strokeFill: StrokeFill;
    setStrokeFill: React.Dispatch<React.SetStateAction<StrokeFill>>;
    strokeWidth: StrokeWidth;
    setStrokeWidth: React.Dispatch<React.SetStateAction<StrokeWidth>>;
    bgFill: BgFill;
    setBgFill: React.Dispatch<React.SetStateAction<BgFill>>;
}

export const Sidebar = ({
    activeTool,
    strokeFill,
    setStrokeFill,
    setStrokeWidth,
    bgFill,
    setBgFill,
}: SidebarProps) => {
    const strokeFills: StrokeFill[] = ["#1971c2", "#1e1e1e", "#2f9e44", "#e03131", "#f08c00"];

    const strokeWidths: StrokeWidth[] = [1, 2, 4]

    const bgFills: BgFill[] = ["#00000000", "#a5d8ff", "#b2f2bb", "#ffc9c9", "#ffec99"];

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
                        {strokeWidths.map((sw, index) => (
                            <StrokeWidthIndicator
                                key={index}
                                strokeWidth={sw}
                                onClick={() => setStrokeWidth(sw)}
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
    color: StrokeFill;
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
    color: BgFill;
    onClick?: () => void;
}) => {
    return (
        <div
            className={"w-[1.4rem] h-[1.4rem] rounded-sm cursor-pointer hover:border border-white/70 transition-all " + `${color === "#00000000" ? "border border-white/30" : ""}`}
            style={{ backgroundColor: color }}
            onClick={onClick}
        ></div>
    );
};


const StrokeWidthIndicator = ({ strokeWidth, onClick }: { strokeWidth: StrokeWidth, onClick?: () => void }) => {
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