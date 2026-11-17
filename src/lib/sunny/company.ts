import { sunnyAgentName } from './config';

export function sunnyCompanyFacts(env: Readonly<Record<string, string | undefined>> = process.env) {
  const name = sunnyAgentName(env);
  return {
    agentName: name,
    brand: 'Sunday Properties',
    url: 'https://sundayproperties.co',
    city: 'Medellín',
    country: 'Colombia',
    phone: '+57 300 679 1123',
    email: 'daniel@luquelaw.co',
    taglineEs:
      'Arrienda y compra en Colombia — con tradición, contrato y visita antes de decidir.',
    taglineEn:
      'Rent and buy in Colombia — with title, contract, and visit before you commit.',
  };
}
