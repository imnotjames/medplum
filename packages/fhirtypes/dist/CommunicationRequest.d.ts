/*
 * Generated by @medplum/generator
 * Do not edit manually.
 */

import { Annotation } from './Annotation';
import { Attachment } from './Attachment';
import { CareTeam } from './CareTeam';
import { CodeableConcept } from './CodeableConcept';
import { Condition } from './Condition';
import { Device } from './Device';
import { DiagnosticReport } from './DiagnosticReport';
import { DocumentReference } from './DocumentReference';
import { Encounter } from './Encounter';
import { Extension } from './Extension';
import { Group } from './Group';
import { HealthcareService } from './HealthcareService';
import { Identifier } from './Identifier';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Observation } from './Observation';
import { Organization } from './Organization';
import { Patient } from './Patient';
import { Period } from './Period';
import { Practitioner } from './Practitioner';
import { PractitionerRole } from './PractitionerRole';
import { Reference } from './Reference';
import { RelatedPerson } from './RelatedPerson';
import { Resource } from './Resource';

/**
 * A request to convey information; e.g. the CDS system proposes that an
 * alert be sent to a responsible provider, the CDS system proposes that
 * the public health agency be notified about a reportable condition.
 */
export interface CommunicationRequest {

  /**
   * This is a CommunicationRequest resource
   */
  readonly resourceType: 'CommunicationRequest';

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
   * Business identifiers assigned to this communication request by the
   * performer or other systems which remain constant as the resource is
   * updated and propagates from server to server.
   */
  readonly identifier?: Identifier[];

  /**
   * A plan or proposal that is fulfilled in whole or in part by this
   * request.
   */
  readonly basedOn?: Reference<Resource>[];

  /**
   * Completed or terminated request(s) whose function is taken by this new
   * request.
   */
  readonly replaces?: Reference<CommunicationRequest>[];

  /**
   * A shared identifier common to all requests that were authorized more
   * or less simultaneously by a single author, representing the identifier
   * of the requisition, prescription or similar form.
   */
  readonly groupIdentifier?: Identifier;

  /**
   * The status of the proposal or order.
   */
  readonly status?: string;

  /**
   * Captures the reason for the current state of the CommunicationRequest.
   */
  readonly statusReason?: CodeableConcept;

  /**
   * The type of message to be sent such as alert, notification, reminder,
   * instruction, etc.
   */
  readonly category?: CodeableConcept[];

  /**
   * Characterizes how quickly the proposed act must be initiated. Includes
   * concepts such as stat, urgent, routine.
   */
  readonly priority?: string;

  /**
   * If true indicates that the CommunicationRequest is asking for the
   * specified action to *not* occur.
   */
  readonly doNotPerform?: boolean;

  /**
   * A channel that was used for this communication (e.g. email, fax).
   */
  readonly medium?: CodeableConcept[];

  /**
   * The patient or group that is the focus of this communication request.
   */
  readonly subject?: Reference<Patient | Group>;

  /**
   * Other resources that pertain to this communication request and to
   * which this communication request should be associated.
   */
  readonly about?: Reference<Resource>[];

  /**
   * The Encounter during which this CommunicationRequest was created or to
   * which the creation of this record is tightly associated.
   */
  readonly encounter?: Reference<Encounter>;

  /**
   * Text, attachment(s), or resource(s) to be communicated to the
   * recipient.
   */
  readonly payload?: CommunicationRequestPayload[];

  /**
   * The time when this communication is to occur.
   */
  readonly occurrenceDateTime?: string;

  /**
   * The time when this communication is to occur.
   */
  readonly occurrencePeriod?: Period;

  /**
   * For draft requests, indicates the date of initial creation.  For
   * requests with other statuses, indicates the date of activation.
   */
  readonly authoredOn?: string;

  /**
   * The device, individual, or organization who initiated the request and
   * has responsibility for its activation.
   */
  readonly requester?: Reference<Practitioner | PractitionerRole | Organization | Patient | RelatedPerson | Device>;

  /**
   * The entity (e.g. person, organization, clinical information system,
   * device, group, or care team) which is the intended target of the
   * communication.
   */
  readonly recipient?: Reference<Device | Organization | Patient | Practitioner | PractitionerRole | RelatedPerson | Group | CareTeam | HealthcareService>[];

  /**
   * The entity (e.g. person, organization, clinical information system, or
   * device) which is to be the source of the communication.
   */
  readonly sender?: Reference<Device | Organization | Patient | Practitioner | PractitionerRole | RelatedPerson | HealthcareService>;

  /**
   * Describes why the request is being made in coded or textual form.
   */
  readonly reasonCode?: CodeableConcept[];

  /**
   * Indicates another resource whose existence justifies this request.
   */
  readonly reasonReference?: Reference<Condition | Observation | DiagnosticReport | DocumentReference>[];

  /**
   * Comments made about the request by the requester, sender, recipient,
   * subject or other participants.
   */
  readonly note?: Annotation[];
}

/**
 * Text, attachment(s), or resource(s) to be communicated to the
 * recipient.
 */
export interface CommunicationRequestPayload {

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
   * The communicated content (or for multi-part communications, one
   * portion of the communication).
   */
  readonly contentString?: string;

  /**
   * The communicated content (or for multi-part communications, one
   * portion of the communication).
   */
  readonly contentAttachment?: Attachment;

  /**
   * The communicated content (or for multi-part communications, one
   * portion of the communication).
   */
  readonly contentReference?: Reference<Resource>;
}
