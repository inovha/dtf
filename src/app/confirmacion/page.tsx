import Link from 'next/link';

export default function ConfirmacionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-indigo-950 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 text-center max-w-md">
        {/* Success Icon */}
        <div className="mx-auto w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6 animate-[bounce_1s_ease-in-out_2]">
          <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-white mb-4">
          ¡Pedido Recibido!
        </h1>
        
        <p className="text-gray-400 mb-8">
          Tu pedido fue registrado correctamente. Te contactamos por WhatsApp 
          cuando esté listo para retirar.
        </p>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 mb-8">
          <h2 className="text-sm font-medium text-gray-300 mb-2">
            ¿Qué sigue?
          </h2>
          <ul className="text-sm text-gray-400 space-y-2 text-left">
            <li className="flex items-start gap-2">
              <span className="text-indigo-400 mt-0.5">1.</span>
              Revisamos tu archivo
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-400 mt-0.5">2.</span>
              Lo procesamos e imprimimos
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-400 mt-0.5">3.</span>
              Te avisamos por WhatsApp cuando esté listo
            </li>
          </ul>
        </div>

        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Hacer otro pedido
        </Link>
      </div>
    </div>
  );
}
