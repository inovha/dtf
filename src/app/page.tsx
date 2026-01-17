import { OrderForm } from '@/components/OrderForm';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-indigo-950">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl" />
      </div>
      
      <div className="relative z-10 mx-auto max-w-xl px-4 py-12 sm:py-20">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              DTF Orders
            </span>
          </h1>
          <p className="mt-4 text-lg text-gray-400">
            Cargá tu archivo y recibí tu pedido listo
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <OrderForm />
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-gray-500">
          Te contactamos por WhatsApp cuando tu pedido esté listo
        </p>
      </div>
    </div>
  );
}
