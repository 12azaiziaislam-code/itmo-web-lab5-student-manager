export default defineEventHandler((event) => {
  const config = useRuntimeConfig();
  const base = (config.apiInternalBase || 'http://localhost:8080/api').replace(/\/$/, '');
  const targetPath = event.path.replace(/^\/api/, '');
  return proxyRequest(event, `${base}${targetPath}`);
});
