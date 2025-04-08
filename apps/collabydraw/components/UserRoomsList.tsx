import { Info } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { UserRoomsListDialog } from "./UserRoomsListDialog";

export default function UserRoomsList() {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="User_Rooms_List fixed z-[4] bottom-4 right-4 rounded-lg hidden md:flex items-center surface-box-shadow">
            <Button type="button" onClick={() => setIsOpen(true)}
                className="collabydraw-button collab-button relative w-auto py-3 px-4 rounded-md text-[.875rem] font-semibold shadow-none bg-color-primary hover:bg-brand-hover active:bg-brand-active active:scale-[.98]"
                title="See All Rooms..."><Info /></Button>
            <UserRoomsListDialog open={isOpen} onOpenChange={setIsOpen} />
        </div>
    );
};
