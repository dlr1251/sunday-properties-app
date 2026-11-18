import {
  BRAND_CITY,
  BRAND_COUNTRY,
  BRAND_EMAIL,
  BRAND_NAME,
  BRAND_PHONE,
  BRAND_TAGLINE,
  BRAND_URL,
} from '../../constants/brand';
import { sunnyAgentName } from './config';

export function sunnyCompanyFacts(env: Readonly<Record<string, string | undefined>> = process.env) {
  const name = sunnyAgentName(env);
  return {
    agentName: name,
    brand: BRAND_NAME,
    url: BRAND_URL,
    city: BRAND_CITY,
    country: BRAND_COUNTRY,
    phone: BRAND_PHONE,
    email: BRAND_EMAIL,
    taglineEs: BRAND_TAGLINE.es,
    taglineEn: BRAND_TAGLINE.en,
  };
}
