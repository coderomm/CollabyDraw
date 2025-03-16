import {
    Square,
    Circle,
    Minus,
    Pencil,
    Eraser,
    Diamond,
    Hand,
    MousePointer,
} from "lucide-react"
import { Tool } from "./canvas";

export const tools: Tool[] = [
    {
        type: "selection",
        icon: <MousePointer />,
        shortcut: 0,
        label: 'Select'
    },
    {
        type: "grab",
        icon: <Hand />,
        shortcut: 1,
        label: 'Grab'
    },
    {
        type: "rectangle",
        icon: <Square />,
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
        type: "diamond",
        icon: <Diamond />,
        shortcut: 4,
        label: 'Diamond'
    },
    {
        type: "line",
        icon: <Minus />,
        shortcut: 5,
        label: 'Line'
    },
    {
        type: "pen",
        icon: <Pencil />,
        shortcut: 6,
        label: 'Arrow'
    },
    {
        type: "eraser",
        icon: <Eraser />,
        shortcut: 7,
        label: 'Eraser'
    }
]