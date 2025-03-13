import CollaborationStartBtn from "./CollaborationStartBtn";

export default function SideToolbar({ slug }: { slug: string }) {
    return (
        <section className="absolute top-20 right-0 flex flex-col items-center justify-center border border-sidebar-border border-r-0 rounded-l-lg overflow-hidden bg-island-bg-color">
            <CollaborationStartBtn slug={slug!} />
        </section>
    )
}