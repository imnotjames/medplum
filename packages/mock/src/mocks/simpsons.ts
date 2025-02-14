import {
  Bundle,
  Communication,
  DiagnosticReport,
  Encounter,
  Media,
  Observation,
  Patient,
  ServiceRequest,
} from '@medplum/fhirtypes';

export const HomerSimpson: Patient = {
  resourceType: 'Patient',
  id: '123',
  meta: {
    versionId: '2',
    lastUpdated: '2020-01-02T00:00:00.000Z',
    author: {
      reference: 'Practitioner/123',
    },
  },
  identifier: [
    { system: 'abc', value: '123' },
    { system: 'def', value: '456' },
  ],
  birthDate: '1956-05-12',
  name: [
    {
      given: ['Homer'],
      family: 'Simpson',
    },
  ],
  photo: [
    {
      contentType: 'image/png',
      url: 'https://docs.medplum.com/img/homer-simpson.png',
    },
  ],
};

export const HomerSimpsonHistory: Bundle<Patient> = {
  resourceType: 'Bundle',
  type: 'history',
  entry: [
    {
      resource: HomerSimpson,
    },
    {
      resource: {
        resourceType: 'Patient',
        id: '123',
        meta: {
          versionId: '1',
          lastUpdated: '2020-01-01T00:00:00.000Z',
          author: {
            reference: 'Practitioner/123',
          },
        },
        name: [
          {
            given: ['Homer'],
            family: 'Simpson',
          },
        ],
        photo: [
          {
            contentType: 'image/png',
            url: 'https://docs.medplum.com/img/homer-simpson.png',
          },
        ],
      },
    },
  ],
};

export const HomerEncounter: Encounter = {
  resourceType: 'Encounter',
  id: '123',
  meta: {
    versionId: '456',
    lastUpdated: '2020-01-01T00:00:00.000Z',
    author: {
      reference: 'Practitioner/123',
    },
  },
};

export const HomerEncounterHistory: Bundle<Encounter> = {
  resourceType: 'Bundle',
  type: 'history',
  entry: [
    {
      resource: HomerEncounter,
    },
  ],
};

export const HomerCommunications: Bundle<Communication> = {
  resourceType: 'Bundle',
  entry: [
    {
      resource: {
        resourceType: 'Communication',
        id: '123',
        meta: {
          lastUpdated: '2020-01-01T12:00:00Z',
          author: {
            reference: 'Practitioner/123',
          },
        },
        payload: [
          {
            contentString: 'Hello world',
          },
        ],
      },
    },
  ],
};

export const HomerMedia: Bundle<Media> = {
  resourceType: 'Bundle',
  entry: [
    {
      resource: {
        resourceType: 'Media',
        id: '123',
        meta: {
          lastUpdated: '2020-01-01T12:00:00Z',
          author: {
            reference: 'Practitioner/123',
          },
        },
        content: {
          contentType: 'text/plain',
          url: 'https://example.com/test.txt',
        },
      },
    },
  ],
};

export const HomerDiagnosticReport: DiagnosticReport = {
  resourceType: 'DiagnosticReport',
  id: '123',
  meta: {
    versionId: '1',
    lastUpdated: '2020-01-02T12:00:00Z',
    author: {
      reference: 'Practitioner/123',
    },
  },
  subject: {
    reference: 'Patient/123',
    display: 'Homer Simpson',
  },
  resultsInterpreter: [
    {
      reference: 'Practitioner/123',
      display: 'Dr. Alice Smith',
    },
  ],
  result: [
    { reference: 'Observation/1' },
    { reference: 'Observation/2' },
    { reference: 'Observation/3' },
    { reference: 'Observation/4' },
    { reference: 'Observation/5' },
    { reference: 'Observation/6' },
  ],
};

export const HomerDiagnosticReportBundle: Bundle<DiagnosticReport> = {
  resourceType: 'Bundle',
  type: 'searchset',
  entry: [
    {
      resource: HomerDiagnosticReport,
    },
  ],
};

export const HomerObservation1: Observation = {
  resourceType: 'Observation',
  id: '1',
  code: {
    text: 'Test 1',
  },
  valueString: 'test',
};

export const HomerObservation2: Observation = {
  resourceType: 'Observation',
  id: '2',
  code: {
    text: 'Test 2',
  },
  valueQuantity: {
    value: 20,
    unit: 'x',
  },
  referenceRange: [
    {
      low: {
        value: 10,
      },
    },
  ],
};

export const HomerObservation3: Observation = {
  resourceType: 'Observation',
  id: '3',
  code: {
    text: 'Test 3',
  },
  valueQuantity: {
    value: 30,
    unit: 'x',
  },
  referenceRange: [
    {
      high: {
        value: 50,
      },
    },
  ],
};

export const HomerObservation4: Observation = {
  resourceType: 'Observation',
  id: '4',
  code: {
    text: 'Test 4',
  },
  valueQuantity: {
    value: 50,
    unit: 'x',
  },
  referenceRange: [
    {
      low: {
        value: 10,
      },
      high: {
        value: 50,
      },
    },
  ],
  interpretation: [
    {
      text: 'HIGH',
    },
  ],
};

export const HomerObservation5: Observation = {
  resourceType: 'Observation',
  id: '5',
  code: {
    text: 'Test 5',
  },
  valueQuantity: {
    value: 100,
    unit: 'x',
  },
  referenceRange: [{}],
  interpretation: [{}],
};

export const HomerObservation6: Observation = {
  resourceType: 'Observation',
  code: {
    text: 'Test 6',
  },
  component: [
    {
      valueQuantity: {
        value: 110,
        unit: 'mmHg',
        system: 'http://unitsofmeasure.org',
      },
    },
    {
      valueQuantity: {
        value: 75,
        unit: 'mmHg',
        system: 'http://unitsofmeasure.org',
      },
    },
  ],
};

export const HomerObservationSearchBundle: Bundle<Observation> = {
  resourceType: 'Bundle',
  total: 1,
  entry: [
    {
      resource: HomerObservation3,
    },
  ],
};

export const HomerServiceRequest: ServiceRequest = {
  resourceType: 'ServiceRequest',
  id: '123',
  meta: {
    versionId: '1',
    lastUpdated: '2020-01-01T12:00:00Z',
    author: {
      reference: 'Practitioner/123',
    },
  },
  code: {
    coding: [
      {
        system: 'http://snomed.info/sct',
        code: 'SERVICE_REQUEST_CODE',
      },
    ],
  },
  subject: {
    reference: 'Patient/123',
    display: 'Homer Simpson',
  },
  status: 'completed',
  orderDetail: [
    {
      text: 'Test 1',
    },
  ],
};

export const HomerServiceRequestHistoryBundle: Bundle<ServiceRequest> = {
  resourceType: 'Bundle',
  type: 'history',
  entry: [
    {
      resource: HomerServiceRequest,
    },
  ],
};

export const HomerServiceRequestSearchBundle: Bundle<ServiceRequest> = {
  resourceType: 'Bundle',
  type: 'searchset',
  entry: [
    {
      resource: HomerServiceRequest,
    },
  ],
};

export const BartSimpson: Patient = {
  resourceType: 'Patient',
  id: '555',
  meta: {
    versionId: '1',
    lastUpdated: '2020-01-01T12:00:00Z',
    author: {
      reference: 'Practitioner/123',
    },
  },
  birthDate: '1979-12-17',
  name: [
    {
      given: ['Bart'],
      family: 'Simpson',
    },
  ],
  photo: [
    {
      contentType: 'image/jpeg',
      url: 'https://example.com/picture.jpg',
    },
  ],
};

export const SimpsonSearchBundle: Bundle<Patient> = {
  resourceType: 'Bundle',
  type: 'searchset',
  total: 2,
  entry: [
    {
      resource: HomerSimpson,
    },
    {
      resource: BartSimpson,
    },
  ],
};
