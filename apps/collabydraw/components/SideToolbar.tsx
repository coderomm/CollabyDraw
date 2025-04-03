import CollaborationToolbar from "./CollaborationToolbar";

export default function SideToolbar() {
    return (
        <section className="absolute top-20 right-0 flex flex-col items-center justify-center border border-sidebar-border border-r-0 rounded-l-lg overflow-hidden bg-island-bg-color">
            <CollaborationToolbar />
        </section>
    )
}