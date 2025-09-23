export type ImageRelationshipOptions = {
  /**
   * Enable or disable the plugin
   * @default false
   */
  enabled: boolean;
  /**
   * The slugs of the collections that the relationship field can point to.
   * The custom component will only be used for relationship fields that have `relationTo` set to one of these slugs.
   */
  relationTo?: string | string[];
}
