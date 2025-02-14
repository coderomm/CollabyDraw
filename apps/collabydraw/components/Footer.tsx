import Link from "next/link";

export default function Footer() {
    return (
        <footer className="border-t py-6 md:py-0">
            <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
                <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
                    <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                        Built with ❤️ for creators everywhere.
                    </p>
                </div>
                <div className="flex gap-4">
                    <Link href="/terms" className="text-sm text-muted-foreground hover:underline">
                        Terms
                    </Link>
                    <Link href="/privacy" className="text-sm text-muted-foreground hover:underline">
                        Privacy
                    </Link>
                </div>
            </div>
        </footer>
    )
}