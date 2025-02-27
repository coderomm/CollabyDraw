import { Circle, Eraser, HandIcon, Pencil, RectangleHorizontalIcon, Slash } from "lucide-react"
import { Separator } from "./ui/separator"
import { Tool, ToolType } from "@/types/canvas"
import { ToolButton } from "./ToolButton"

interface ToolbarProps {
    activeTool: ToolType
    setActiveTool: (s: ToolType) => void
}

export const Toolbar = ({ activeTool, setActiveTool }: ToolbarProps) => {

    const Tool: Tool[] = [{
        type: "grab",
        icon: <HandIcon />,
        shortcut: 1,
        label: 'Grab'
    },
    {
        type: "rectangle",
        icon: <RectangleHorizontalIcon />,
        shortcut: 2,
        label: 'Rectangle'
    },
    {
        type: "ellipse",
        icon: <Circle />,
        shortcut: 3,
        label: 'Ellipse'
    },
    {
        type: "line",
        icon: <Slash />,
        shortcut: 4,
        label: 'Line'
    },
    {
        type: "pen",
        icon: <Pencil />,
        shortcut: 5,
        label: 'Arrow'
    },
    {
        type: "eraser",
        icon: <Eraser />,
        shortcut: 6,
        label: 'Eraser'
    }
    ]

    return (
        <div className="w-fit h-16 py-2 px-4 fixed top-5 left-[50%] -translate-x-[50%]">
            <div className="flex bg-[#232329] px-4 py-1 rounded-md gap-3 h-full">
                {Tool.map((tool) => {
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