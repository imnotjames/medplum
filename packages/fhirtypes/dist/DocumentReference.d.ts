/*
 * Generated by @medplum/generator
 * Do not edit manually.
 */

import { Attachment } from './Attachment';
import { CodeableConcept } from './CodeableConcept';
import { Coding } from './Coding';
import { Device } from './Device';
import { Encounter } from './Encounter';
import { EpisodeOfCare } from './EpisodeOfCare';
import { Extension } from './Extension';
import { Group } from './Group';
import { Identifier } from './Identifier';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Organization } from './Organization';
import { Patient } from './Patient';
import { Period } from './Period';
import { Practitioner } from './Practitioner';
import { PractitionerRole } from './PractitionerRole';
import { Reference } from './Reference';
import { RelatedPerson } from './RelatedPerson';
import { Resource } from './Resource';

/**
 * A reference to a document of any kind for any purpose. Provides
 * metadata about the document so that the document can be discovered and
 * managed. The scope of a document is any seralized object with a
 * mime-type, so includes formal patient centric documents (CDA), cliical
 * notes, scanned paper, and non-patient specific documents like policy
 * text.
 */
export interface DocumentReference {

  /**
   * This is a DocumentReference resource
   */
  readonly resourceType: 'DocumentReference';

  /**
   * The logical id of the resource, as used in the URL for the resource.
   * Once assigned, this value never changes.
   */
  readonly id?: string;

  /**
   * The metadata about the resource. This is content that is maintained by
   * the infrastructure. Changes to the content might not always be
   * associated with version changes to the resource.
   */
  readonly meta?: Meta;

  /**
   * A reference to a set of rules that were followed when the resource was
   * constructed, and which must be understood when processing the content.
   * Often, this is a reference to an implementation guide that defines the
   * special rules along with other profiles etc.
   */
  readonly implicitRules?: string;

  /**
   * The base language in which the resource is written.
   */
  readonly language?: string;

  /**
   * A human-readable narrative that contains a summary of the resource and
   * can be used to represent the content of the resource to a human. The
   * narrative need not encode all the structured data, but is required to
   * contain sufficient detail to make it &quot;clinically safe&quot; for a human to
   * just read the narrative. Resource definitions may define what content
   * should be represented in the narrative to ensure clinical safety.
   */
  readonly text?: Narrative;

  /**
   * These resources do not have an independent existence apart from the
   * resource that contains them - they cannot be identified independently,
   * and nor can they have their own independent transaction scope.
   */
  readonly contained?: Resource[];

  /**
   * May be used to represent additional information that is not part of
   * the basic definition of the resource. To make the use of extensions
   * safe and manageable, there is a strict set of governance  applied to
   * the definition and use of extensions. Though any implementer can
   * define an extension, there is a set of requirements that SHALL be met
   * as part of the definition of the extension.
   */
  readonly extension?: Extension[];

  /**
   * May be used to represent additional information that is not part of
   * the basic definition of the resource and that modifies the
   * understanding of the element that contains it and/or the understanding
   * of the containing element's descendants. Usually modifier elements
   * provide negation or qualification. To make the use of extensions safe
   * and manageable, there is a strict set of governance applied to the
   * definition and use of extensions. Though any implementer is allowed to
   * define an extension, there is a set of requirements that SHALL be met
   * as part of the definition of the extension. Applications processing a
   * resource are required to check for modifier extensions.
   *
   * Modifier extensions SHALL NOT change the meaning of any elements on
   * Resource or DomainResource (including cannot change the meaning of
   * modifierExtension itself).
   */
  readonly modifierExtension?: Extension[];

  /**
   * Document identifier as assigned by the source of the document. This
   * identifier is specific to this version of the document. This unique
   * identifier may be used elsewhere to identify this version of the
   * document.
   */
  readonly masterIdentifier?: Identifier;

  /**
   * Other identifiers associated with the document, including version
   * independent identifiers.
   */
  readonly identifier?: Identifier[];

  /**
   * The status of this document reference.
   */
  readonly status?: string;

  /**
   * The status of the underlying document.
   */
  readonly docStatus?: string;

  /**
   * Specifies the particular kind of document referenced  (e.g. History
   * and Physical, Discharge Summary, Progress Note). This usually equates
   * to the purpose of making the document referenced.
   */
  readonly type?: CodeableConcept;

  /**
   * A categorization for the type of document referenced - helps for
   * indexing and searching. This may be implied by or derived from the
   * code specified in the DocumentReference.type.
   */
  readonly category?: CodeableConcept[];

  /**
   * Who or what the document is about. The document can be about a person,
   * (patient or healthcare practitioner), a device (e.g. a machine) or
   * even a group of subjects (such as a document about a herd of farm
   * animals, or a set of patients that share a common exposure).
   */
  readonly subject?: Reference<Patient | Practitioner | Group | Device>;

  /**
   * When the document reference was created.
   */
  readonly date?: string;

  /**
   * Identifies who is responsible for adding the information to the
   * document.
   */
  readonly author?: Reference<Practitioner | PractitionerRole | Organization | Device | Patient | RelatedPerson>[];

  /**
   * Which person or organization authenticates that this document is
   * valid.
   */
  readonly authenticator?: Reference<Practitioner | PractitionerRole | Organization>;

  /**
   * Identifies the organization or group who is responsible for ongoing
   * maintenance of and access to the document.
   */
  readonly custodian?: Reference<Organization>;

  /**
   * Relationships that this document has with other document references
   * that already exist.
   */
  readonly relatesTo?: DocumentReferenceRelatesTo[];

  /**
   * Human-readable description of the source document.
   */
  readonly description?: string;

  /**
   * A set of Security-Tag codes specifying the level of privacy/security
   * of the Document. Note that DocumentReference.meta.security contains
   * the security labels of the &quot;reference&quot; to the document, while
   * DocumentReference.securityLabel contains a snapshot of the security
   * labels on the document the reference refers to.
   */
  readonly securityLabel?: CodeableConcept[];

  /**
   * The document and format referenced. There may be multiple content
   * element repetitions, each with a different format.
   */
  readonly content?: DocumentReferenceContent[];

  /**
   * The clinical context in which the document was prepared.
   */
  readonly context?: DocumentReferenceContext;
}

/**
 * The document and format referenced. There may be multiple content
 * element repetitions, each with a different format.
 */
export interface DocumentReferenceContent {

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
   * May be used to represent additional information that is not part of
   * the basic definition of the element and that modifies the
   * understanding of the element in which it is contained and/or the
   * understanding of the containing element's descendants. Usually
   * modifier elements provide negation or qualification. To make the use
   * of extensions safe and manageable, there is a strict set of governance
   * applied to the definition and use of extensions. Though any
   * implementer can define an extension, there is a set of requirements
   * that SHALL be met as part of the definition of the extension.
   * Applications processing a resource are required to check for modifier
   * extensions.
   *
   * Modifier extensions SHALL NOT change the meaning of any elements on
   * Resource or DomainResource (including cannot change the meaning of
   * modifierExtension itself).
   */
  readonly modifierExtension?: Extension[];

  /**
   * The document or URL of the document along with critical metadata to
   * prove content has integrity.
   */
  readonly attachment?: Attachment;

  /**
   * An identifier of the document encoding, structure, and template that
   * the document conforms to beyond the base format indicated in the
   * mimeType.
   */
  readonly format?: Coding;
}

/**
 * The clinical context in which the document was prepared.
 */
export interface DocumentReferenceContext {

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
   * May be used to represent additional information that is not part of
   * the basic definition of the element and that modifies the
   * understanding of the element in which it is contained and/or the
   * understanding of the containing element's descendants. Usually
   * modifier elements provide negation or qualification. To make the use
   * of extensions safe and manageable, there is a strict set of governance
   * applied to the definition and use of extensions. Though any
   * implementer can define an extension, there is a set of requirements
   * that SHALL be met as part of the definition of the extension.
   * Applications processing a resource are required to check for modifier
   * extensions.
   *
   * Modifier extensions SHALL NOT change the meaning of any elements on
   * Resource or DomainResource (including cannot change the meaning of
   * modifierExtension itself).
   */
  readonly modifierExtension?: Extension[];

  /**
   * Describes the clinical encounter or type of care that the document
   * content is associated with.
   */
  readonly encounter?: Reference<Encounter | EpisodeOfCare>[];

  /**
   * This list of codes represents the main clinical acts, such as a
   * colonoscopy or an appendectomy, being documented. In some cases, the
   * event is inherent in the type Code, such as a &quot;History and Physical
   * Report&quot; in which the procedure being documented is necessarily a
   * &quot;History and Physical&quot; act.
   */
  readonly event?: CodeableConcept[];

  /**
   * The time period over which the service that is described by the
   * document was provided.
   */
  readonly period?: Period;

  /**
   * The kind of facility where the patient was seen.
   */
  readonly facilityType?: CodeableConcept;

  /**
   * This property may convey specifics about the practice setting where
   * the content was created, often reflecting the clinical specialty.
   */
  readonly practiceSetting?: CodeableConcept;

  /**
   * The Patient Information as known when the document was published. May
   * be a reference to a version specific, or contained.
   */
  readonly sourcePatientInfo?: Reference<Patient>;

  /**
   * Related identifiers or resources associated with the
   * DocumentReference.
   */
  readonly related?: Reference<Resource>[];
}

/**
 * Relationships that this document has with other document references
 * that already exist.
 */
export interface DocumentReferenceRelatesTo {

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
   * May be used to represent additional information that is not part of
   * the basic definition of the element and that modifies the
   * understanding of the element in which it is contained and/or the
   * understanding of the containing element's descendants. Usually
   * modifier elements provide negation or qualification. To make the use
   * of extensions safe and manageable, there is a strict set of governance
   * applied to the definition and use of extensions. Though any
   * implementer can define an extension, there is a set of requirements
   * that SHALL be met as part of the definition of the extension.
   * Applications processing a resource are required to check for modifier
   * extensions.
   *
   * Modifier extensions SHALL NOT change the meaning of any elements on
   * Resource or DomainResource (including cannot change the meaning of
   * modifierExtension itself).
   */
  readonly modifierExtension?: Extension[];

  /**
   * The type of relationship that this document has with anther document.
   */
  readonly code?: string;

  /**
   * The target document of this relationship.
   */
  readonly target?: Reference<DocumentReference>;
}
