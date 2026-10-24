export default function MenuBoardsSkeleton() {
    return (
        <div className="grid animate-pulse gap-4 sm:grid-cols-2">
            {[0, 1, 2].map((indice) => (
                <div key={indice} className="h-48 rounded-xl bg-gray-100 dark:bg-slate-800" />
            ))}
        </div>
    );
}
