import { Separator } from "./ui/separator"
import { ToolType } from "@/types/canvas"
import { ToolButton } from "./ToolButton"
import { tools } from "@/types/Tools"

interface ToolbarProps {
    activeTool: ToolType
    setActiveTool: (s: ToolType) => void
}

export const Toolbar = ({ activeTool, setActiveTool }: ToolbarProps) => {

    return (
        <div className="w-fit h-16 py-2 px-4 fixed top-5 left-[50%] -translate-x-[50%]">
            <div className="flex bg-[#232329] px-4 py-1 rounded-md gap-3 h-full">
                {tools.map((tool) => {
                    return (
                        <div key={tool.type} className="flex items-center">
                            <ToolButton active={activeTool === tool.type} onClick={() => setActiveTool(tool.type)} icon={tool.icon} shortcut={tool.shortcut} tool={tool.type} />
                            {tool.type === "grab" ? (<Separator orientation="vertical" className="bg-white/20 mx-1" />) : null}
                        </div>
                    )
                }
                )}
            </div>
            <p className="text-white/30 mt-1 absolute w-full mx-auto scale-[0.8] text-sm text-center">To zoom, use scroll or pinch!</p>
        </div >
    )
}