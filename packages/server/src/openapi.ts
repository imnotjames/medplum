import { Request, Response } from 'express';
import { JSONSchema4 } from 'json-schema';
import {
  ComponentsObject,
  OpenAPIObject,
  ReferenceObject,
  SchemaObject,
  SecurityRequirementObject,
  TagObject,
} from 'openapi3-ts';
import { getConfig } from './config';
import { getSchemaDefinitions } from './fhir';

type SchemaMap = { [schema: string]: SchemaObject | ReferenceObject };

let cachedSpec: any;

export function openApiHandler(req: Request, res: Response): void {
  res.status(200).json(getSpec());
}

function getSpec(): any {
  if (!cachedSpec) {
    cachedSpec = buildSpec();
  }
  return cachedSpec;
}

function buildSpec(): any {
  const result = buildBaseSpec();
  const definitions = getSchemaDefinitions();
  Object.entries(definitions).forEach(([name, definition]) => buildFhirType(result, name, definition));
  buildPaths(result);
  return result;
}

/**
 * Builds the base structure of the OpenAPI specification.
 * See: https://swagger.io/specification/
 */
function buildBaseSpec(): OpenAPIObject {
  const config = getConfig();
  return {
    openapi: '3.0.2',
    info: {
      title: 'Medplum - OpenAPI 3.0',
      description:
        'Medplum OpenAPI 3.0 specification.  You can find out more about Medplum at [https://www.medplum.com](https://www.medplum.com).',
      termsOfService: 'https://www.medplum.com/docs/terms/',
      contact: {
        email: 'hello@medplum.com',
      },
      license: {
        name: 'Apache 2.0',
        url: 'https://www.apache.org/licenses/LICENSE-2.0.html',
      },
      version: '1.0.5',
    },
    externalDocs: {
      description: 'Find out more about Medplum',
      url: 'https://www.medplum.com/',
    },
    servers: [
      {
        url: config.baseUrl,
      },
    ],
    security: buildSecurity(),
    tags: [],
    paths: {},
    components: {
      schemas: {},
      securitySchemes: {
        OAuth2: {
          type: 'oauth2',
          flows: {
            authorizationCode: {
              authorizationUrl: config.authorizeUrl,
              tokenUrl: config.tokenUrl,
              scopes: {
                openid: 'OpenID',
              },
            },
          },
        },
      },
    },
  };
}

/**
 * Builds the OpenAPI security defintions.
 * @returns The OpenAPI security defintions.
 */
function buildSecurity(): SecurityRequirementObject[] {
  return [
    {
      OAuth2: ['openid'],
    },
  ];
}

/**
 * Builds the OpenAPI specification details for a FHIR type.
 * @param result The OpenAPI specification output.
 * @param typeName The FHIR type name.
 * @param typeDefinition The FHIR type definition.
 */
function buildFhirType(result: OpenAPIObject, typeName: string, typeDefinition: JSONSchema4): void {
  buildSchema(result, typeName, typeDefinition);
  if (hasEndpoint(typeDefinition)) {
    buildTags(result, typeName, typeDefinition);
  }

  ((result.components as ComponentsObject).schemas as SchemaMap)['Resource'] = {
    oneOf: [{ $ref: '#/components/schemas/Patient' }, { $ref: '#/components/schemas/Observation' }],
  };
}

/**
 * Builds the schema for a FHIR type.
 * See: https://swagger.io/specification/#schema-object
 * @param result The OpenAPI specification output.
 * @param typeName The FHIR type name.
 * @param typeDefinition The FHIR type definition.
 */
function buildSchema(result: OpenAPIObject, typeName: string, typeDefinition: JSONSchema4): void {
  ((result.components as ComponentsObject).schemas as SchemaMap)[typeName] = buildObjectSchema(
    typeName,
    typeDefinition
  );
}

/**
 * Converts a JSONSchema type definition to an OpenAPI type definition.
 * @param name The type name.
 * @param definition The JSONSchema type definition.
 * @returns The OpenAPI type definition.
 */
function buildObjectSchema(name: string, definition: JSONSchema4): SchemaObject {
  const result = JSON.parse(JSON.stringify(definition, refReplacer));
  const resourceTypeProperty = result.properties?.resourceType;
  if (resourceTypeProperty && resourceTypeProperty.const) {
    delete resourceTypeProperty.const;
    resourceTypeProperty.type = 'string';
  }
  return result;
}

/**
 * Replaces JSONSchema references with OpenAPI references.
 * Can be used as 2nd parameter in JSON.stringify.
 * @param key The JSON property key.
 * @param value The JSON property value.
 * @returns The updated JSON property value.
 */
function refReplacer(key: string, value: any): any {
  if (key === '$ref') {
    return (value as string).replace('#/definitions/', '#/components/schemas/');
  }
  if (key === 'oneOf' || key === 'extension' || key === '_extension') {
    return undefined;
  }
  return value;
}

/**
 * Builds the tags for a FHIR type.
 * See: https://swagger.io/specification/#tag-object
 * @param result The OpenAPI specification output.
 * @param typeName The FHIR type name.
 * @param typeDefinition The FHIR type definition.
 */
function buildTags(result: OpenAPIObject, typeName: string, typeDefinition: JSONSchema4): void {
  (result.tags as TagObject[]).push({
    name: typeName,
    description: typeDefinition.description,
    externalDocs: {
      url: 'https://docs.medplum.com/fhir/R4/' + typeName,
    },
  });
}

/**
 * Builds the paths for a FHIR resource type.
 * @param result The OpenAPI specification output.
 */
function buildPaths(result: OpenAPIObject): void {
  result.paths[`/fhir/R4/{resourceType}`] = {
    get: buildSearchPath(),
    post: buildCreatePath(),
  };

  result.paths[`/fhir/R4/{resourceType}/{id}`] = {
    get: buildReadPath(),
    put: buildUpdatePath(),
    delete: buildDeletePath(),
    patch: buildPatchPath(),
  };

  result.paths[`/fhir/R4/{resourceType}/{id}/_history`] = {
    get: buildReadHistoryPath(),
  };

  result.paths[`/fhir/R4/{resourceType}/{id}/_history/{versionId}`] = {
    get: buildReadVersionPath(),
  };
}

function buildSearchPath(): any {
  return {
    summary: 'Search',
    description: 'Search',
    operationId: 'search',
    parameters: [
      {
        name: 'resourceType',
        in: 'path',
        description: 'Resource Type',
        required: true,
        schema: {
          type: 'string',
        },
      },
    ],
    responses: {
      '200': {
        description: 'Success',
        content: {
          'application/fhir+json': {
            schema: {
              $ref: '#/components/schemas/Bundle',
            },
          },
        },
      },
    },
  };
}

function buildCreatePath(): any {
  return {
    summary: 'Create Resource',
    description: 'Create Resource',
    operationId: 'createResource',
    parameters: [
      {
        name: 'resourceType',
        in: 'path',
        description: 'Resource Type',
        required: true,
        schema: {
          type: 'string',
        },
      },
    ],
    requestBody: {
      description: 'Create Resource',
      content: {
        'application/fhir+json': {
          schema: {
            $ref: '#/components/schemas/Resource',
          },
        },
      },
      required: true,
    },
    responses: {
      '201': {
        description: 'Success',
        content: {
          'application/fhir+json': {
            schema: {
              $ref: '#/components/schemas/Resource',
            },
          },
        },
      },
    },
  };
}

function buildReadPath(): any {
  return {
    summary: 'Read Resource',
    description: 'Read Resource',
    operationId: 'readResource',
    parameters: [
      {
        name: 'resourceType',
        in: 'path',
        description: 'Resource Type',
        required: true,
        schema: {
          type: 'string',
        },
      },
      {
        name: 'id',
        in: 'path',
        description: 'Resource ID',
        required: true,
        schema: {
          type: 'string',
          format: 'uuid',
        },
      },
    ],
    responses: {
      '200': {
        description: 'Success',
        content: {
          'application/fhir+json': {
            schema: {
              $ref: '#/components/schemas/Resource',
            },
          },
        },
      },
    },
  };
}

function buildReadHistoryPath(): any {
  return {
    summary: 'Read Resource History',
    description: 'Read Resource History',
    operationId: 'readResourceHistory',
    parameters: [
      {
        name: 'resourceType',
        in: 'path',
        description: 'Resource Type',
        required: true,
        schema: {
          type: 'string',
        },
      },
      {
        name: 'id',
        in: 'path',
        description: 'Resource ID',
        required: true,
        schema: {
          type: 'string',
          format: 'uuid',
        },
      },
    ],
    responses: {
      '200': {
        description: 'Success',
        content: {
          'application/fhir+json': {
            schema: {
              $ref: '#/components/schemas/Bundle',
            },
          },
        },
      },
    },
  };
}

function buildReadVersionPath(): any {
  return {
    summary: 'Read Version',
    description: 'Read Version',
    operationId: 'readVersion',
    parameters: [
      {
        name: 'resourceType',
        in: 'path',
        description: 'Resource Type',
        required: true,
        schema: {
          type: 'string',
        },
      },
      {
        name: 'id',
        in: 'path',
        description: 'Resource ID',
        required: true,
        schema: {
          type: 'string',
          format: 'uuid',
        },
      },
      {
        name: 'versionId',
        in: 'path',
        description: 'Version ID',
        required: true,
        schema: {
          type: 'string',
          format: 'uuid',
        },
      },
    ],
    responses: {
      '200': {
        description: 'Success',
        content: {
          'application/fhir+json': {
            schema: {
              $ref: '#/components/schemas/Resource',
            },
          },
        },
      },
    },
  };
}

function buildUpdatePath(): any {
  return {
    summary: 'Update Resource',
    description: 'Update Resource',
    operationId: 'updateResource',
    parameters: [
      {
        name: 'resourceType',
        in: 'path',
        description: 'Resource Type',
        required: true,
        schema: {
          type: 'string',
        },
      },
      {
        name: 'id',
        in: 'path',
        description: 'Resource ID',
        required: true,
        schema: {
          type: 'string',
          format: 'uuid',
        },
      },
    ],
    requestBody: {
      description: 'Update Resource',
      content: {
        'application/fhir+json': {
          schema: {
            $ref: '#/components/schemas/Resource',
          },
        },
      },
      required: true,
    },
    responses: {
      '200': {
        description: 'Success',
        content: {
          'application/fhir+json': {
            schema: {
              $ref: '#/components/schemas/Resource',
            },
          },
        },
      },
    },
  };
}

function buildDeletePath(): any {
  return {
    summary: 'Delete Resource',
    description: 'Delete Resource',
    operationId: 'deleteResource',
    parameters: [
      {
        name: 'resourceType',
        in: 'path',
        description: 'Resource Type',
        required: true,
        schema: {
          type: 'string',
        },
      },
      {
        name: 'id',
        in: 'path',
        description: 'Resource ID',
        required: true,
        schema: {
          type: 'string',
          format: 'uuid',
        },
      },
    ],
    responses: {
      '204': {
        description: 'Success',
      },
    },
  };
}

function buildPatchPath(): any {
  return {
    summary: 'Patch Resource',
    description: 'Patch Resource',
    operationId: 'patchResource',
    parameters: [
      {
        name: 'resourceType',
        in: 'path',
        description: 'Resource Type',
        required: true,
        schema: {
          type: 'string',
        },
      },
      {
        name: 'id',
        in: 'path',
        description: 'Resource ID',
        required: true,
        schema: {
          type: 'string',
          format: 'uuid',
        },
      },
    ],
    responses: {
      '204': {
        description: 'Success',
      },
    },
  };
}

function hasEndpoint(definition: any): boolean {
  const props = definition?.properties;
  return props && 'resourceType' in props && 'id' in props;
}
