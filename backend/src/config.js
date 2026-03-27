import dotenv from 'dotenv';

dotenv.config();

const splitPlants = (value = '') =>
  value
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);

const isTrue = (value = '') => ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());

export const config = {
  port: Number(process.env.PORT || 4000),
  sapUrl: process.env.SAP_URL || '',
  sapUsername: process.env.SAP_USERNAME || '',
  sapPassword: process.env.SAP_PASSWORD || '',
  sapClient: process.env.SAP_CLIENT || '',
  sapPlants: splitPlants(process.env.SAP_PLANTS),
  pollMs: Number(process.env.POLL_INTERVAL_MS || 5000),
  forceSimulation: isTrue(process.env.FORCE_SIMULATION),
};

export const hasLiveSapCreds = Boolean(
  !config.forceSimulation && config.sapUrl && config.sapUsername && config.sapPassword,
);
