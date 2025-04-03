import { cn } from "@/lib/utils";

export function PaletteFilled({ className }: { className?: string }) {
    return (
        <svg aria-hidden="true" focusable="false" role="img" viewBox="0 0 512 512" className={cn(className)}>
            <path fill="currentColor" d="M204.3 5C104.9 24.4 24.8 104.3 5.2 203.4c-37 187 131.7 326.4 258.8 306.7 41.2-6.4 61.4-54.6 42.5-91.7-23.1-45.4 9.9-98.4 60.9-98.4h79.7c35.8 0 64.8-29.6 64.9-65.3C511.5 97.1 368.1-26.9 204.3 5zM96 320c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32zm32-128c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32zm128-64c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32zm128 64c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32z"></path>
        </svg>
    )
}

export function EllipsisVertical({ className }: { className: string }) {
    return (
        < svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={cn("size-6", className)}>
            <path fillRule="evenodd" d="M10.5 6a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm0 6a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm0 6a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z" clipRule="evenodd" />
        </svg >
    )
}

export function ListBullet({ className }: { className: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={cn("size-6", className)}>
            <path fillRule="evenodd" d="M2.625 6.75a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875 0A.75.75 0 0 1 8.25 6h12a.75.75 0 0 1 0 1.5h-12a.75.75 0 0 1-.75-.75ZM2.625 12a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0ZM7.5 12a.75.75 0 0 1 .75-.75h12a.75.75 0 0 1 0 1.5h-12A.75.75 0 0 1 7.5 12Zm-4.875 5.25a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875 0a.75.75 0 0 1 .75-.75h12a.75.75 0 0 1 0 1.5h-12a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
        </svg>
    )
}

export function TextIcon({ className }: { className: string }) {
    return (
        <svg aria-hidden="true" focusable="false" role="img" viewBox="0 0 24 24" className={cn("size-6", className)} fill="none" strokeWidth="2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <g strokeWidth="1.5">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <line x1="4" y1="20" x2="7" y2="20"></line>
                <line x1="14" y1="20" x2="21" y2="20"></line>
                <line x1="6.9" y1="15" x2="13.8" y2="15"></line>
                <line x1="10.2" y1="6.3" x2="16" y2="20"></line>
                <polyline points="5 20 11 4 13 4 20 20"></polyline>
            </g>
        </svg>
    )
}

export function EncryptedIcon({ className }: { className: string }) {
    return (
        <svg aria-hidden="true" focusable="false" role="img" viewBox="0 0 24 24" className={cn("size-6", className)}>
            <path fill="currentColor" d="M11.553 22.894a.998.998 0 00.894 0s3.037-1.516 5.465-4.097C19.616 16.987 21 14.663 21 12V5a1 1 0 00-.649-.936l-8-3a.998.998 0 00-.702 0l-8 3A1 1 0 003 5v7c0 2.663 1.384 4.987 3.088 6.797 2.428 2.581 5.465 4.097 5.465 4.097zm-1.303-8.481l6.644-6.644a.856.856 0 111.212 1.212l-7.25 7.25a.856.856 0 01-1.212 0l-3.75-3.75a.856.856 0 111.212-1.212l3.144 3.144z"></path>
        </svg>
    )
}