# Graph Report - StellarCodex  (2026-05-04)

## Corpus Check
- 61 files · ~14,982 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 120 nodes · 90 edges · 4 communities detected
- Extraction: 72% EXTRACTED · 28% INFERRED · 0% AMBIGUOUS · INFERRED: 25 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 7|Community 7]]

## God Nodes (most connected - your core abstractions)
1. `chatCompleteWithFallback()` - 9 edges
2. `buildProviderRegistry()` - 7 edges
3. `initVault()` - 6 edges
4. `getRegistry()` - 4 edges
5. `runConsistencyCheck()` - 4 edges
6. `getProviderSecret()` - 4 edges
7. `encryptUtf8()` - 4 edges
8. `generateWorldBibleFromConcepts()` - 3 edges
9. `buildSciFiMessages()` - 3 edges
10. `resolveProviderChain()` - 3 edges

## Surprising Connections (you probably didn't know these)
- `configureAiRegistry()` --calls--> `buildProviderRegistry()`  [INFERRED]
  src/services/ai/aiService.ts → src/services/ai/core/providerRegistry.ts
- `chatCompleteWithFallback()` --calls--> `resolveProviderChain()`  [INFERRED]
  src/services/ai/aiService.ts → src/services/ai/core/hybridRouter.ts
- `chatCompleteWithFallback()` --calls--> `isCircuitOpen()`  [INFERRED]
  src/services/ai/aiService.ts → src/services/ai/core/circuitBreaker.ts
- `chatCompleteWithFallback()` --calls--> `getProviderSecret()`  [INFERRED]
  src/services/ai/aiService.ts → src/services/security/aiKeyVault.ts
- `chatCompleteWithFallback()` --calls--> `recordSuccess()`  [INFERRED]
  src/services/ai/aiService.ts → src/services/ai/core/circuitBreaker.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.14
Nodes (8): configureAiRegistry(), getProviderOrThrow(), getRegistry(), createGeminiAdapter(), createMockAdapter(), createOllamaAdapter(), createOpenAIAdapter(), buildProviderRegistry()

### Community 1 - "Community 1"
Cohesion: 0.21
Nodes (11): getProviderSecret(), initVault(), isVaultInitialized(), saveProviderSecret(), unlock(), vaultSecretResolver(), decryptUtf8(), deriveVaultKey() (+3 more)

### Community 2 - "Community 2"
Cohesion: 0.23
Nodes (8): chatCompleteWithFallback(), generateWorldBibleFromConcepts(), isCircuitOpen(), recordFailure(), recordSuccess(), mapKindToTemplate(), runConsistencyCheck(), buildSciFiMessages()

### Community 7 - "Community 7"
Cohesion: 1.0
Nodes (2): dedupe(), resolveProviderChain()

## Knowledge Gaps
- **Thin community `Community 7`** (3 nodes): `dedupe()`, `resolveProviderChain()`, `hybridRouter.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `chatCompleteWithFallback()` connect `Community 2` to `Community 0`, `Community 1`, `Community 7`?**
  _High betweenness centrality (0.104) - this node is a cross-community bridge._
- **Why does `getProviderSecret()` connect `Community 1` to `Community 2`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **Are the 7 inferred relationships involving `chatCompleteWithFallback()` (e.g. with `generateWorldBibleFromConcepts()` and `resolveProviderChain()`) actually correct?**
  _`chatCompleteWithFallback()` has 7 INFERRED edges - model-reasoned connections that need verification._
- **Are the 6 inferred relationships involving `buildProviderRegistry()` (e.g. with `configureAiRegistry()` and `getRegistry()`) actually correct?**
  _`buildProviderRegistry()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `initVault()` (e.g. with `randomBytes()` and `deriveVaultKey()`) actually correct?**
  _`initVault()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `runConsistencyCheck()` (e.g. with `buildSciFiMessages()` and `chatCompleteWithFallback()`) actually correct?**
  _`runConsistencyCheck()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.14 - nodes in this community are weakly interconnected._