/*
 * Generated by @medplum/generator
 * Do not edit manually.
 */

import { Attachment } from './Attachment';
import { Extension } from './Extension';

/**
 * Base StructureDefinition for RelatedArtifact Type: Related artifacts
 * such as additional documentation, justification, or bibliographic
 * references.
 */
export interface RelatedArtifact {

  /**
   * Unique id for the element within a resource (for internal references).
   * This may be any string value that does not contain spaces.
   */
  readonly id?: string;

  /**
   * May be used to represent additional information that is not part of
   * the basic definition of the element. To make the use of extensions
   * safe and manageable, there is a strict set of governance  applied to
   * the definition and use of extensions. Though any implementer can
   * define an extension, there is a set of requirements that SHALL be met
   * as part of the definition of the extension.
   */
  readonly extension?: Extension[];

  /**
   * The type of relationship to the related artifact.
   */
  readonly type?: string;

  /**
   * A short label that can be used to reference the citation from
   * elsewhere in the containing artifact, such as a footnote index.
   */
  readonly label?: string;

  /**
   * A brief description of the document or knowledge resource being
   * referenced, suitable for display to a consumer.
   */
  readonly display?: string;

  /**
   * A bibliographic citation for the related artifact. This text SHOULD be
   * formatted according to an accepted citation format.
   */
  readonly citation?: string;

  /**
   * A url for the artifact that can be followed to access the actual
   * content.
   */
  readonly url?: string;

  /**
   * The document being referenced, represented as an attachment. This is
   * exclusive with the resource element.
   */
  readonly document?: Attachment;

  /**
   * The related resource, such as a library, value set, profile, or other
   * knowledge resource.
   */
  readonly resource?: string;
}
