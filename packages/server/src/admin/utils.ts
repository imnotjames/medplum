import { assertOk, Operator } from '@medplum/core';
import { BundleEntry, Project, ProjectMembership } from '@medplum/fhirtypes';
import { Request, Response } from 'express';
import { systemRepo } from '../fhir';

export interface ProjectDetails {
  project: Project;
  memberships: ProjectMembership[];
}

/**
 * Verifies that the current user is a project admin.
 * Assumes that "projectId" is a path parameter.
 * Assumes that res.locals.user is populated by authenticateToken middleware.
 * @param req The request.
 * @param res The response.
 * @returns Project details if the current user is a project admin; undefined otherwise.
 */
export async function verifyProjectAdmin(req: Request, res: Response): Promise<ProjectDetails | undefined> {
  const { projectId } = req.params;

  const [projectOutcome, project] = await systemRepo.readResource<Project>('Project', projectId);
  assertOk(projectOutcome, project);

  const [membershipOutcome, bundle] = await systemRepo.search<ProjectMembership>({
    resourceType: 'ProjectMembership',
    filters: [
      {
        code: 'project',
        operator: Operator.EQUALS,
        value: 'Project/' + projectId,
      },
    ],
  });
  assertOk(membershipOutcome, bundle);

  const memberships = (bundle.entry as BundleEntry<ProjectMembership>[]).map(
    (entry) => entry.resource as ProjectMembership
  );

  if (!memberships.find((m) => m.user?.reference === 'User/' + res.locals.user && m.admin)) {
    return undefined;
  }

  return {
    project,
    memberships,
  };
}
