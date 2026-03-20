import { Link } from "wouter";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg text-center">
          <h1 className="text-3xl font-bold text-[#1a1a1a] mb-4">
            Undergraduate Hobbies Survey
          </h1>
          <p className="text-base text-gray-600 mb-10 leading-relaxed">
            Help us learn more about undergraduate business students! This short
            survey asks about your background and the hobbies you enjoy in your
            free time. Your responses are anonymous and will only be used for
            class research.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/survey"
              className="inline-block px-8 py-3 rounded-lg bg-[#8A3BDB] text-white font-semibold text-base hover:bg-[#7a32c5] focus:outline-none focus:ring-2 focus:ring-[#8A3BDB] focus:ring-offset-2 transition-colors"
            >
              Take the Survey
            </Link>
            <Link
              href="/results"
              className="inline-block px-8 py-3 rounded-lg border-2 border-[#8A3BDB] text-[#8A3BDB] font-semibold text-base hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-[#8A3BDB] focus:ring-offset-2 transition-colors"
            >
              View Results
            </Link>
          </div>
        </div>
      </main>
      <footer className="py-4 text-center text-sm text-gray-500 border-t border-gray-200">
        Survey by Mike Colbert, BAIS:3300 - spring 2026.
      </footer>
    </div>
  );
}
