'use client'

import { useState } from 'react'

// ─── Types ───
export type Bilan360Step = 'welcome' | 'situation' | 'risks' | 'coverage' | 'summary'

export interface Bilan360Data {
  // Situation personnelle
  maritalStatus: string
  childrenCount: number
  dependentsCount: number
  dependentsDetails: string
  // Situation professionnelle
  profession: string
  employmentStatus: string
  yearsOfActivity: number
  careerEvolution: boolean
  careerEvolutionDetails: string
}

const INITIAL_DATA: Bilan360Data = {
  maritalStatus: '',
  childrenCount: 0,
  dependentsCount: 0,
  dependentsDetails: '',
  profession: '',
  employmentStatus: '',
  yearsOfActivity: 0,
  careerEvolution: false,
  careerEvolutionDetails: '',
}

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
  const [data, setData] = useState<Bilan360Data>(INITIAL_DATA)

  const currentIndex = STEPS.findIndex(s => s.key === currentStep)

  const updateData = (updates: Partial<Bilan360Data>) => {
    setData(prev => ({ ...prev, ...updates }))
  }

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
        className="absolute top-0 right-0 p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition z-10"
        title="Fermer le bilan"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Progress bar (hidden on welcome) */}
      {currentStep !== 'welcome' && (
        <div className="mb-8">
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
          <SituationStep data={data} onChange={updateData} />
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
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-amber-400 rounded-full animate-pulse" />
        <div className="absolute -bottom-1 -left-3 w-3 h-3 bg-green-400 rounded-full animate-pulse delay-300" />
      </div>

      <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">
        Bienvenue dans votre Bilan 360°
      </h2>

      {clientName && (
        <p className="text-lg text-[#00358E] font-semibold mb-2">
          {clientName}
        </p>
      )}

      <p className="text-gray-500 max-w-lg mb-4 leading-relaxed">
        Cet entretien vise à mieux comprendre vos besoins et les risques potentiels
        afin de recommander les meilleures couvertures d&apos;assurance.
      </p>

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

      <button
        onClick={onStart}
        className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#00358E] to-[#0052D4] text-white text-base font-semibold rounded-2xl hover:shadow-xl hover:shadow-blue-500/25 hover:-translate-y-0.5 transition-all duration-200"
      >
        Commencer le Bilan 360°
        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </button>

      <p className="text-xs text-gray-400 mt-4 flex items-center gap-1.5">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Durée estimée : 10-15 minutes
      </p>
    </div>
  )
}


// ─── Situation Step (Bloc 1 + Bloc 2) ───
const MARITAL_OPTIONS = [
  { value: '', label: 'Sélectionner...' },
  { value: 'SINGLE', label: 'Célibataire' },
  { value: 'MARRIED', label: 'Marié(e)' },
  { value: 'PACS', label: 'Pacsé(e)' },
  { value: 'DIVORCED', label: 'Divorcé(e)' },
  { value: 'WIDOWED', label: 'Veuf/Veuve' },
]

const EMPLOYMENT_OPTIONS = [
  { value: '', label: 'Sélectionner...' },
  { value: 'EMPLOYEE', label: 'Salarié(e)' },
  { value: 'SELF_EMPLOYED', label: 'Indépendant(e)' },
  { value: 'CIVIL_SERVANT', label: 'Fonctionnaire' },
  { value: 'RETIRED', label: 'Retraité(e)' },
  { value: 'UNEMPLOYED', label: 'Sans emploi' },
  { value: 'OTHER', label: 'Autre' },
]

function SituationStep({ data, onChange }: { data: Bilan360Data; onChange: (updates: Partial<Bilan360Data>) => void }) {
  return (
    <div className="space-y-8">
      {/* ── Bloc 1: Situation personnelle ── */}
      <section>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
            <svg className="w-5 h-5 text-[#00358E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Situation personnelle</h3>
            <p className="text-xs text-gray-500">Informations sur la situation familiale du client</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Statut marital */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Statut marital
            </label>
            <select
              value={data.maritalStatus}
              onChange={(e) => onChange({ maritalStatus: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-sm text-gray-900 focus:border-[#00358E] focus:ring-0 outline-none transition"
            >
              {MARITAL_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Nombre d'enfants */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nombre d&apos;enfants
            </label>
            <input
              type="number"
              min={0}
              value={data.childrenCount}
              onChange={(e) => onChange({ childrenCount: Math.max(0, parseInt(e.target.value) || 0) })}
              className="w-full px-3.5 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-sm text-gray-900 focus:border-[#00358E] focus:ring-0 outline-none transition"
            />
          </div>

          {/* Personnes à charge */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Personnes à charge (hors enfants)
            </label>
            <input
              type="number"
              min={0}
              value={data.dependentsCount}
              onChange={(e) => onChange({ dependentsCount: Math.max(0, parseInt(e.target.value) || 0) })}
              className="w-full px-3.5 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-sm text-gray-900 focus:border-[#00358E] focus:ring-0 outline-none transition"
            />
          </div>

          {/* Précisions personnes à charge */}
          {data.dependentsCount > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Précisions (personnes à charge)
              </label>
              <input
                type="text"
                value={data.dependentsDetails}
                onChange={(e) => onChange({ dependentsDetails: e.target.value })}
                placeholder="Ex: parents âgés, proche handicapé..."
                className="w-full px-3.5 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#00358E] focus:ring-0 outline-none transition"
              />
            </div>
          )}
        </div>
      </section>

      {/* Separator */}
      <div className="border-t border-gray-100" />

      {/* ── Bloc 2: Situation professionnelle ── */}
      <section>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Situation professionnelle</h3>
            <p className="text-xs text-gray-500">Informations sur l&apos;activité et la carrière du client</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Profession */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Profession actuelle
            </label>
            <input
              type="text"
              value={data.profession}
              onChange={(e) => onChange({ profession: e.target.value })}
              placeholder="Ex: Ingénieur, Comptable, Artisan..."
              className="w-full px-3.5 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#00358E] focus:ring-0 outline-none transition"
            />
          </div>

          {/* Statut d'emploi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Statut d&apos;emploi
            </label>
            <select
              value={data.employmentStatus}
              onChange={(e) => onChange({ employmentStatus: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-sm text-gray-900 focus:border-[#00358E] focus:ring-0 outline-none transition"
            >
              {EMPLOYMENT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Années d'activité */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Années d&apos;activité
            </label>
            <input
              type="number"
              min={0}
              value={data.yearsOfActivity}
              onChange={(e) => onChange({ yearsOfActivity: Math.max(0, parseInt(e.target.value) || 0) })}
              className="w-full px-3.5 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-sm text-gray-900 focus:border-[#00358E] focus:ring-0 outline-none transition"
            />
          </div>

          {/* Évolution de carrière */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Évolution de carrière prévue ?
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => onChange({ careerEvolution: true })}
                className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition ${
                  data.careerEvolution
                    ? 'border-[#00358E] bg-blue-50 text-[#00358E]'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                Oui
              </button>
              <button
                type="button"
                onClick={() => onChange({ careerEvolution: false, careerEvolutionDetails: '' })}
                className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition ${
                  !data.careerEvolution
                    ? 'border-[#00358E] bg-blue-50 text-[#00358E]'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                Non
              </button>
            </div>
          </div>

          {/* Détails évolution */}
          {data.careerEvolution && (
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Précisions sur l&apos;évolution prévue
              </label>
              <textarea
                value={data.careerEvolutionDetails}
                onChange={(e) => onChange({ careerEvolutionDetails: e.target.value })}
                placeholder="Ex: promotion prévue, reconversion, départ à la retraite dans 5 ans..."
                rows={2}
                className="w-full px-3.5 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#00358E] focus:ring-0 outline-none transition resize-none"
              />
            </div>
          )}
        </div>
      </section>
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
