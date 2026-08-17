'use client';

import { createContext, useContext } from 'react';

interface PlanFeatures {
  /** Plano permite os recursos de IA (Plan.hasAiFeatures). */
  aiAllowed: boolean;
}

/**
 * Disponibiliza as permissões do plano para componentes client sem passar prop
 * por toda a árvore. Os controles de IA aparecem em quatro formulários e em
 * vários campos dentro deles — encadear `aiAllowed` até cada um deixaria a
 * assinatura de todo formulário intermediário dependente do plano.
 *
 * O padrão é `true`: se um componente for renderizado fora do provider, ele não
 * esconde a funcionalidade por engano. O bloqueio de verdade é no servidor
 * (assertAiAllowed nas rotas), e isto aqui só evita oferecer um botão que vai
 * falhar.
 */
const PlanFeaturesContext = createContext<PlanFeatures>({ aiAllowed: true });

export function PlanFeaturesProvider({
  aiAllowed,
  children,
}: {
  aiAllowed: boolean;
  children: React.ReactNode;
}) {
  return (
    <PlanFeaturesContext.Provider value={{ aiAllowed }}>{children}</PlanFeaturesContext.Provider>
  );
}

export function usePlanFeatures() {
  return useContext(PlanFeaturesContext);
}
