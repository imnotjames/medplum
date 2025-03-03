import { Patient, Reference, Resource } from '@medplum/fhirtypes';

declare const google: unknown;

export function getPatient(resource: Resource): Patient | Reference<Patient> | undefined {
  if (resource.resourceType === 'Patient') {
    return resource;
  }
  if (
    resource.resourceType === 'DiagnosticReport' ||
    resource.resourceType === 'Encounter' ||
    resource.resourceType === 'Observation' ||
    resource.resourceType === 'ServiceRequest'
  ) {
    return resource.subject as Reference<Patient>;
  }
  return undefined;
}

/**
 * Dynamically loads the Google Auth script.
 * We do not want to load the script on page load unless the user needs it.
 */
export function initGoogleAuth(): void {
  if (typeof google === 'undefined') {
    createScriptTag('https://accounts.google.com/gsi/client');
  }
}

/**
 * Dynamically loads the recaptcha script.
 * We do not want to load the script on page load unless the user needs it.
 */
export function initRecaptcha(): void {
  if (typeof grecaptcha === 'undefined') {
    createScriptTag('https://www.google.com/recaptcha/api.js?render=' + process.env.RECAPTCHA_SITE_KEY);
  }
}

/**
 * Dynamically creates a script tag for the specified JavaScript file.
 * @param src The JavaScript file URL.
 */
function createScriptTag(src: string): void {
  const head = document.getElementsByTagName('head')[0];
  const script = document.createElement('script');
  script.async = true;
  script.src = src;
  head.appendChild(script);
}

/**
 * Starts a request to generate a recapcha token.
 * @returns Promise to a recaptcha token for the current user.
 */
export function getRecaptcha(): Promise<string> {
  return new Promise((resolve) => {
    grecaptcha.ready(() => {
      grecaptcha.execute(process.env.RECAPTCHA_SITE_KEY as string, { action: 'submit' }).then(resolve);
    });
  });
}
