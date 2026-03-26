'use client'

import { useState } from 'react'

// ─── Types ───
export type Bilan360Step = 'welcome' | 'situation' | 'risks' | 'coverage' | 'summary'

interface Bilan360WizardProps {
  clientName?: string
  onClose?: () => void
}

// ─── Steps config (extensible) ───
const STEPS: { key: Bilan360Step; label: string }[] = [
  { key: 'welcome', label: 'Accueil' },
  { key: 'situation', label: 'Situation' },
  { key: 'risks', label: 'Risques' },
  { key: 'coverage', label: 'Couvertures' },
  { key: 'summary', label: 'Synthèse' },
]

// ─── Main Wizard ───
export default function Bilan360Wizard({ clientName, onClose }: Bilan360WizardProps) {
  const [currentStep, setCurrentStep] = useState<Bilan360Step>('welcome')

  const currentIndex = STEPS.findIndex(s => s.key === currentStep)

  const goNext = () => {
    if (currentIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentIndex + 1].key)
    }
  }

  const goBack = () => {
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1].key)
    } else {
      onClose?.()
    }
  }

  return (
    <div className="min-h-[60vh] flex flex-col relative">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-0 right-0 p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
        title="Fermer le bilan"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Progress bar (hidden on welcome) */}
      {currentStep !== 'welcome' && (
        <div className="mb-8">
          {/* Step indicators */}
          <div className="flex items-center justify-between mb-3">
            {STEPS.filter(s => s.key !== 'welcome').map((step, i) => {
              const stepIndex = STEPS.findIndex(s => s.key === step.key)
              const isActive = stepIndex === currentIndex
              const isDone = stepIndex < currentIndex
              return (
                <div key={step.key} className="flex items-center gap-2 flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isActive ? 'bg-[#00358E] text-white scale-110 shadow-md' :
                    isDone ? 'bg-green-500 text-white' :
                    'bg-gray-200 text-gray-500'
                  }`}>
                    {isDone ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : i + 1}
                  </div>
                  <span className={`text-xs font-medium hidden sm:inline ${
                    isActive ? 'text-[#00358E]' : isDone ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {step.label}
                  </span>
                  {i < STEPS.length - 2 && (
                    <div className={`flex-1 h-0.5 mx-2 rounded ${isDone ? 'bg-green-400' : 'bg-gray-200'}`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Step content */}
      <div className="flex-1">
        {currentStep === 'welcome' && (
          <WelcomeStep onStart={goNext} clientName={clientName} />
        )}
        {currentStep === 'situation' && (
          <PlaceholderStep
            title="Situation personnelle"
            description="Questions sur la situation familiale, professionnelle et patrimoniale du client."
            icon="👤"
          />
        )}
        {currentStep === 'risks' && (
          <PlaceholderStep
            title="Analyse des risques"
            description="Identification des risques potentiels selon le profil du client."
            icon="⚠️"
          />
        )}
        {currentStep === 'coverage' && (
          <PlaceholderStep
            title="Couvertures recommandées"
            description="Recommandations de produits adaptés aux besoins identifiés."
            icon="🛡️"
          />
        )}
        {currentStep === 'summary' && (
          <PlaceholderStep
            title="Synthèse du bilan"
            description="Récapitulatif complet et plan d'action pour le client."
            icon="📋"
          />
        )}
      </div>

      {/* Navigation buttons (hidden on welcome) */}
      {currentStep !== 'welcome' && (
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
          <button
            onClick={goBack}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour
          </button>

          <div className="text-xs text-gray-400">
            Étape {currentIndex} sur {STEPS.length - 1}
          </div>

          {currentIndex < STEPS.length - 1 ? (
            <button
              onClick={goNext}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#00358E] text-white text-sm font-medium rounded-xl hover:bg-[#002a70] transition shadow-sm"
            >
              Suivant
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Terminer le bilan
            </button>
          )}
        </div>
      )}
    </div>
  )
}


// ─── Welcome Step ───
function WelcomeStep({ onStart, clientName }: { onStart: () => void; clientName?: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-8 sm:py-16">
      {/* Icon */}
      <div className="relative mb-8">
        <div className="w-24 h-24 bg-gradient-to-br from-[#00358E] to-[#0052D4] rounded-3xl flex items-center justify-center shadow-xl shadow-blue-500/20 rotate-3">
          <svg className="w-12 h-12 text-white -rotate-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        {/* Decorative dots */}
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-amber-400 rounded-full animate-pulse" />
        <div className="absolute -bottom-1 -left-3 w-3 h-3 bg-green-400 rounded-full animate-pulse delay-300" />
      </div>

      {/* Title */}
      <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">
        Bienvenue dans votre Bilan 360°
      </h2>

      {clientName && (
        <p className="text-lg text-[#00358E] font-semibold mb-2">
          {clientName}
        </p>
      )}

      {/* Description */}
      <p className="text-gray-500 max-w-lg mb-4 leading-relaxed">
        Cet entretien vise à mieux comprendre vos besoins et les risques potentiels
        afin de recommander les meilleures couvertures d&apos;assurance.
      </p>

      {/* Steps preview */}
      <div className="flex flex-wrap justify-center gap-3 mb-10">
        {[
          { icon: '👤', label: 'Situation personnelle' },
          { icon: '⚠️', label: 'Analyse des risques' },
          { icon: '🛡️', label: 'Couvertures' },
          { icon: '📋', label: 'Synthèse' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl text-sm text-gray-600">
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      {/* CTA Button */}
      <button
        onClick={onStart}
        className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#00358E] to-[#0052D4] text-white text-base font-semibold rounded-2xl hover:shadow-xl hover:shadow-blue-500/25 hover:-translate-y-0.5 transition-all duration-200"
      >
        Commencer le Bilan 360°
        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </button>

      {/* Duration hint */}
      <p className="text-xs text-gray-400 mt-4 flex items-center gap-1.5">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Durée estimée : 10-15 minutes
      </p>
    </div>
  )
}


// ─── Placeholder for future steps ───
function PlaceholderStep({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
      <span className="text-5xl mb-4 block">{icon}</span>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-md mx-auto mb-4">{description}</p>
      <span className="inline-block px-4 py-2 bg-amber-50 text-amber-700 text-sm font-medium rounded-xl">
        Prochainement disponible
      </span>
    </div>
  )
}
