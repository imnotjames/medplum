/*
 * Generated by @medplum/generator
 * Do not edit manually.
 */

import { Extension } from './Extension';

/**
 * Base StructureDefinition for Money Type: An amount of economic utility
 * in some recognized currency.
 */
export interface Money {

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
   * Numerical value (with implicit precision).
   */
  readonly value?: number;

  /**
   * ISO 4217 Currency Code.
   */
  readonly currency?: string;
}
