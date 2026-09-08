import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-5xl font-bold text-gray-900">🧜‍♀️ ARIEL</h1>
        <p className="text-xl text-gray-600">Accounting</p>
        <p className="text-gray-500 max-w-md mx-auto">
          O escritório que nunca perde um prazo nem um lead.
        </p>
        <Link
          href="/inbox"
          className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
        >
          Entrar no Dashboard
        </Link>
      </div>
    </div>
  );
}
