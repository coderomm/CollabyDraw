import { ReactNode } from "react"

interface ToolProps {
    tool: string
    icon: ReactNode
    shortcut: number
    onClick: () => void
    active: boolean
}

export const ToolButton = ({ icon, shortcut, onClick, active }: ToolProps) => {
    return <div onClick={onClick} className={` p-1 hover:bg-[#31303B] transition-all text-white/30 cursor-pointer relative rounded-md  
     ${active ? "bg-[#403E6A] hover:bg-[#3e3c6a] text-white/70" : ""}`} >
        <div className="scale-[0.7] m-1">{icon}</div>
        <p className="absolute -bottom-1 right-1 scale-[0.7] ">{shortcut}</p>
    </div>
}