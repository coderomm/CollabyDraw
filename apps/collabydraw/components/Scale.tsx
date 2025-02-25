export const Scale = ({ scale }: { scale: number }) => {
    return (
        <div className="w-fit py-2 px-4 fixed bottom-10 left-10">
            <div className="flex bg-[#232329] px-4 py-2 rounded-md gap-3">
                <p className="text-white">{Math.round(scale * 100)}%</p>
            </div>
        </div>
    )
}