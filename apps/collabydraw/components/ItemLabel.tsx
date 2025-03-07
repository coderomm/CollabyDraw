export default function ItemLabel({ label }: { label: string }) {
    return (
        <h3 aria-hidden={true} className="m-0 mb-1 text-xs font-normal text-text-primary-color dark:text-w-text">
            {label}
        </h3>
    );
};