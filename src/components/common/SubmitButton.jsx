export default function SubmitButton ({
    children,
    className="",
    onClick
}) {
    return (
        <button
            className={`p-2 bg-blue-400 border rounded text-white w-30 hover:bg-blue-500 ${className}`}
            onClick={onClick}
        >
            {children}
        </button>
    )
}