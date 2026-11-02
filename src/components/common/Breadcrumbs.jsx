import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function Breadcrumbs({ items = [] }) {
    const defaultItems = [
        // { label: 'Dashboard', path: '/admin/dashboard' }
    ];

    const allItems = items.length > 0 ? items : defaultItems;

    return (
        <nav aria-label="Breadcrumb" className="my-2">
            <ol className="inline-flex items-center space-x-1 md:space-x-2 text-sm text-gray-600">
                <li className="inline-flex items-center">
                    <Link
                        to="/admin"
                        className="inline-flex items-center text-gray-500 hover:text-gray-900 transition-colors"
                    >
                        <Home className="w-4 h-4 mr-1" />
                        <span>Home</span>
                    </Link>
                </li>

                {allItems.map((item, index) => {
                    const isLast = index === allItems.length - 1;

                    return (
                        <li key={index} className="inline-flex items-center">
                            {/* Separator Slash */}
                            <span className="mx-2 text-gray-400">/</span>

                            {isLast || !item.path ? (
                                <span className="font-semibold text-gray-800">
                                    {item.label}
                                </span>
                            ) : (
                                <Link
                                    to={`${item.path}`}
                                    className="hover:text-gray-900 transition-colors"
                                >
                                    {item.label}
                                </Link>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}