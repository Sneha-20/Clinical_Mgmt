import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
      
      {/* SVG 404 */}
      <div className="mb-8">
        <svg
          width="300"
          height="200"
          viewBox="0 0 500 300"
          xmlns="http://www.w3.org/2000/svg"
          className="mx-auto"
        >
          {/* 404 Text */}
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            fill="#3B82F6"
            fontSize="120"
            fontWeight="bold"
            dy=".3em"
          >
            404
          </text>

          {/* Decorative Circle */}
          <circle
            cx="250"
            cy="150"
            r="120"
            stroke="#93C5FD"
            strokeWidth="4"
            fill="none"
            strokeDasharray="10 10"
          />
        </svg>
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        Page Not Found
      </h1>

      {/* Subtitle */}
      <p className="text-gray-500 max-w-md mb-6">
        Sorry, the page you're looking for doesn’t exist or may have been moved.
      </p>

      {/* Button */}
      <Link
        href="/"
        className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300"
      >
        Return Home
      </Link>
    </div>
  );
}