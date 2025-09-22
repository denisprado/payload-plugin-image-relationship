import type { Plugin } from 'payload'

// Define an options type, even if it's empty for now.
// This makes it easy to add options in the future.
export type ImageRelationshipOptions = Record<string, never>

export const imageRelationshipPlugin = (): Plugin => (incomingConfig) => {
  // Plugin options are not used in the backend at the moment.
  // The main functionality is client-side.
  return incomingConfig
}
