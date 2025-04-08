import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import Link from "next/link";
import { EncryptedIcon } from "./SvgIcons";

export default function EncryptedWidget() {
    return (
        <div className="Secure_App_Tooltip fixed z-[4] bottom-4 right-4 rounded-lg hidden md:flex items-center surface-box-shadow">
            <TooltipProvider delayDuration={0}>
                <Tooltip key={""}>
                    <TooltipTrigger asChild>
                        <Link href="!#" className="text-color-primary">
                            <EncryptedIcon className="w-[1.2rem] h-[1.2rem]" />
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent className="font-collabyfont">
                        Your drawings are end-to-end encrypted so Collabydraw&apos;s servers will never see them.
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    );
};