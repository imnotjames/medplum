import { resolveId } from '@medplum/core';
import { Document, Loading, MedplumLink, ResourceBadge, useMedplum } from '@medplum/ui';
import React, { useEffect, useState } from 'react';

export function ProjectPage(): JSX.Element {
  const medplum = useMedplum();
  const id = resolveId(medplum.getActiveLogin()?.project) as string;
  const [loading, setLoading] = useState<boolean>(true);
  const [result, setResult] = useState<any>();
  const [error, setError] = useState();

  useEffect(() => {
    medplum
      .get('admin/projects/' + id)
      .then((response) => {
        setResult(response);
        setLoading(false);
      })
      .catch((reason) => setError(reason));
  }, [id]);

  if (error) {
    return (
      <Document>
        <pre data-testid="error">{JSON.stringify(error, undefined, 2)}</pre>
      </Document>
    );
  }

  if (loading || !result) {
    return <Loading />;
  }

  return (
    <Document width={600}>
      <h1>Admin / Projects / {result.project.name}</h1>
      <h3>Members</h3>
      <table className="medplum-table">
        <colgroup>
          <col style={{ width: '60%' }} />
          <col style={{ width: '20%' }} />
          <col style={{ width: '20%' }} />
        </colgroup>
        <thead>
          <tr>
            <th>Name</th>
            <th className="medplum-center">Role</th>
            <th className="medplum-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {result.members
            .filter((member: any) => member.role !== 'client')
            .map((member: any) => (
              <tr key={member.profile.reference}>
                <td>
                  <ResourceBadge value={member.profile} link={true} />
                </td>
                <td className="medplum-center">{member.role}</td>
                <td className="medplum-center">
                  <MedplumLink to={`/admin/projects/${id}/members/${member.id}`}>Access</MedplumLink>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
      <div className="medplum-right">
        <MedplumLink to={`/admin/projects/${result.project.id}/invite`}>Invite new user</MedplumLink>
      </div>
      <h3>Clients</h3>
      <table className="medplum-table">
        <colgroup>
          <col style={{ width: '80%' }} />
          <col style={{ width: '20%' }} />
        </colgroup>
        <thead>
          <tr>
            <th>Name</th>
            <th className="medplum-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {result.members
            .filter((member: any) => member.role === 'client')
            .map((member: any) => (
              <tr key={member.profile.reference}>
                <td>
                  <ResourceBadge value={member.profile} link={true} />
                </td>
                <td className="medplum-center">
                  <MedplumLink to={`/admin/projects/${id}/members/${member.id}`}>Access</MedplumLink>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
      <div className="medplum-right">
        <MedplumLink to={`/admin/projects/${result.project.id}/client`}>Create new client</MedplumLink>
      </div>
    </Document>
  );
}
