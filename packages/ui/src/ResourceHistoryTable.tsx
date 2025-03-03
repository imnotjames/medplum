import { Bundle, Resource } from '@medplum/fhirtypes';
import React, { useEffect, useState } from 'react';
import { DateTimeDisplay } from './DateTimeDisplay';
import { MedplumLink } from './MedplumLink';
import { useMedplum } from './MedplumProvider';
import { ResourceBadge } from './ResourceBadge';
import './Table.css';

export interface ResourceHistoryTableProps {
  history?: Bundle;
  resourceType?: string;
  id?: string;
}

export function ResourceHistoryTable(props: ResourceHistoryTableProps): JSX.Element {
  const medplum = useMedplum();
  const [value, setValue] = useState<Bundle | undefined>(props.history);

  useEffect(() => {
    if (!props.history && props.resourceType && props.id) {
      medplum.readHistory(props.resourceType, props.id).then((result) => setValue(result));
    }
  }, [props.history, props.resourceType, props.id]);

  if (!value) {
    return <div>Loading...</div>;
  }

  return (
    <table className="medplum-table">
      <thead>
        <tr>
          <th>Author</th>
          <th>Date</th>
          <th>Version</th>
        </tr>
      </thead>
      <tbody>
        {value.entry?.map((entry) => (
          <HistoryRow key={entry.resource?.meta?.versionId} version={entry.resource as Resource} />
        ))}
      </tbody>
    </table>
  );
}

interface HistoryRowProps {
  version: Resource;
}

function HistoryRow(props: HistoryRowProps): JSX.Element {
  return (
    <tr>
      <td>
        <ResourceBadge value={props.version.meta?.author} link={true} />
      </td>
      <td>
        <DateTimeDisplay value={props.version.meta?.lastUpdated} />
      </td>
      <td>
        <MedplumLink to={getVersionUrl(props.version)}>{props.version.meta?.versionId}</MedplumLink>
      </td>
    </tr>
  );
}

function getVersionUrl(resource: Resource): string {
  return `/${resource.resourceType}/${resource.id}/_history/${resource.meta?.versionId}`;
}
