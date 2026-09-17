import type { Config } from 'tailwindcss';
const config: Config = { content: ['./app/**/*.{ts,tsx}','./components/**/*.{ts,tsx}','./lib/**/*.{ts,tsx}'], theme: { extend: { colors: { avm: { 50:'#fff7ed',500:'#f97316',600:'#ea580c' } } } }, plugins: [] };
export default config;
