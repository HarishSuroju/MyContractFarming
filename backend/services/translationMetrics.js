const metrics = {
  providerUsage: {},
  cacheHits: 0,
  cacheMisses: 0,
};

function incProvider(provider) {
  metrics.providerUsage[provider] = (metrics.providerUsage[provider] || 0) + 1;
}

function incCacheHit() {
  metrics.cacheHits += 1;
}

function incCacheMiss() {
  metrics.cacheMisses += 1;
}

function snapshot() {
  return { ...metrics, providerUsage: { ...metrics.providerUsage } };
}

module.exports = { incProvider, incCacheHit, incCacheMiss, snapshot };
