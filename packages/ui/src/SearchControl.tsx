import { Filter, IndexedStructureDefinition, SearchRequest } from '@medplum/core';
import { Bundle, OperationOutcome, Resource } from '@medplum/fhirtypes';
import React, { useEffect, useRef, useState } from 'react';
import { Button } from './Button';
import { Loading } from './Loading';
import { useMedplum } from './MedplumProvider';
import { SearchFieldEditor } from './SearchFieldEditor';
import { SearchFilterEditor } from './SearchFilterEditor';
import { SearchFilterValueDisplay } from './SearchFilterValueDisplay';
import { SearchPopupMenu } from './SearchPopupMenu';
import { buildFieldNameString, getOpString, movePage, renderValue } from './SearchUtils';
import { TitleBar } from './TitleBar';
import { killEvent } from './utils/dom';
import './SearchControl.css';

export class SearchChangeEvent extends Event {
  readonly definition: SearchRequest;

  constructor(definition: SearchRequest) {
    super('change');
    this.definition = definition;
  }
}

export class SearchLoadEvent extends Event {
  readonly response: Bundle;

  constructor(response: Bundle) {
    super('load');
    this.response = response;
  }
}

export class SearchClickEvent extends Event {
  readonly resource: Resource;
  readonly browserEvent: React.MouseEvent;

  constructor(resource: Resource, browserEvent: React.MouseEvent) {
    super('click');
    this.resource = resource;
    this.browserEvent = browserEvent;
  }
}

export interface SearchControlProps {
  search: SearchRequest;
  checkboxesEnabled?: boolean;
  onLoad?: (e: SearchLoadEvent) => void;
  onChange?: (e: SearchChangeEvent) => void;
  onClick?: (e: SearchClickEvent) => void;
  onAuxClick?: (e: SearchClickEvent) => void;
  onNew?: () => void;
  onExport?: () => void;
  onDelete?: (ids: string[]) => void;
  onPatch?: (ids: string[]) => void;
}

interface SearchControlState {
  searchResponse?: Bundle;
  selected: { [id: string]: boolean };
  popupVisible: boolean;
  popupX: number;
  popupY: number;
  popupField: string;
  fieldEditorVisible: boolean;
  filterEditorVisible: boolean;
}

/**
 * The SearchControl component represents the embeddable search table control.
 * It includes the table, rows, headers, sorting, etc.
 * It does not include the field editor, filter editor, pagination buttons.
 */
export function SearchControl(props: SearchControlProps): JSX.Element {
  const medplum = useMedplum();
  const [schema, setSchema] = useState<IndexedStructureDefinition | undefined>();
  const [outcome, setOutcome] = useState<OperationOutcome | undefined>();

  const [state, setState] = useState<SearchControlState>({
    selected: {},
    popupVisible: false,
    popupX: 0,
    popupY: 0,
    popupField: '',
    fieldEditorVisible: false,
    filterEditorVisible: false,
  });

  const stateRef = useRef<SearchControlState>(state);
  stateRef.current = state;

  function requestResources(): void {
    setOutcome(undefined);
    medplum
      .search({ ...props.search, total: 'accurate' })
      .then((response) => {
        setState({ ...stateRef.current, searchResponse: response });
        if (props.onLoad) {
          props.onLoad(new SearchLoadEvent(response));
        }
      })
      .catch((reason) => {
        setState({ ...stateRef.current, searchResponse: undefined });
        setOutcome(reason);
      });
  }

  function handleSingleCheckboxClick(e: React.ChangeEvent, id: string): void {
    e.stopPropagation();

    const el = e.target as HTMLInputElement;
    const checked = el.checked;
    const newSelected = { ...stateRef.current.selected };
    if (checked) {
      newSelected[id] = true;
    } else {
      delete newSelected[id];
    }
    setState({ ...stateRef.current, selected: newSelected });
  }

  function handleAllCheckboxClick(e: React.ChangeEvent): void {
    e.stopPropagation();

    const el = e.target as HTMLInputElement;
    const checked = el.checked;
    const newSelected = {} as { [id: string]: boolean };
    const searchResponse = stateRef.current?.searchResponse;
    if (checked && searchResponse?.entry) {
      searchResponse.entry.forEach((entry) => {
        if (entry.resource?.id) {
          newSelected[entry.resource.id] = true;
        }
      });
    }
    setState({ ...stateRef.current, selected: newSelected });
  }

  function isAllSelected(): boolean {
    const state = stateRef.current;
    if (!state.searchResponse?.entry || state.searchResponse.entry.length === 0) {
      return false;
    }
    for (const e of state.searchResponse.entry) {
      if (e.resource?.id && !state.selected[e.resource.id]) {
        return false;
      }
    }
    return true;
  }

  /**
   * Handles a click on a column header cell.
   * @param e The click event.
   * @param key The field key.
   */
  function handleSortClick(e: React.MouseEvent, key: string): void {
    setState({
      ...stateRef.current,
      popupVisible: true,
      popupX: e.clientX,
      popupY: e.clientY,
      popupField: key,
    });
  }

  /**
   * Emits a change event to the optional change listener.
   * @param newSearch The new search definition.
   */
  function emitSearchChange(newSearch: SearchRequest): void {
    if (props.onChange) {
      props.onChange(new SearchChangeEvent(newSearch));
    }
  }

  /**
   * Handles a click on a order row.
   *
   * @param e The click event.
   * @param resource The FHIR resource.
   */
  function handleRowClick(e: React.MouseEvent, resource: Resource): void {
    if (e.target instanceof HTMLInputElement && e.target.type === 'checkbox') {
      // Ignore clicks on checkboxes
      return;
    }

    killEvent(e);

    if (e.button !== 1 && props.onClick) {
      props.onClick(new SearchClickEvent(resource, e));
    }

    if (e.button === 1 && props.onAuxClick) {
      props.onAuxClick(new SearchClickEvent(resource, e));
    }
  }

  useEffect(() => {
    medplum.requestSchema(props.search.resourceType).then((newSchema) => {
      // The schema could have the same object identity,
      // so need to use the spread operator to kick React re-render.
      setSchema({ ...newSchema });
    });
  }, [props.search.resourceType]);

  useEffect(() => requestResources(), [props.search]);

  if (!schema?.types?.[props.search.resourceType]) {
    return <Loading />;
  }

  const checkboxColumn = props.checkboxesEnabled;
  const search = props.search;
  const fields = search.fields || ['id', '_lastUpdated'];
  const resourceType = search.resourceType;
  const lastResult = state.searchResponse;
  const entries = lastResult?.entry;
  const resources = entries?.map((e) => e.resource);

  return (
    <div className="medplum-search-control" onContextMenu={(e) => killEvent(e)} data-testid="search-control">
      <TitleBar>
        <div>
          <h1>
            <a href={`https://www.hl7.org/fhir/${resourceType.toLowerCase()}.html`} target="_blank" rel="noopener">
              {resourceType}
            </a>
          </h1>
          <Button
            testid="fields-button"
            size="small"
            onClick={() => setState({ ...stateRef.current, fieldEditorVisible: true })}
          >
            Fields
          </Button>
          <Button
            testid="filters-button"
            size="small"
            onClick={() => setState({ ...stateRef.current, filterEditorVisible: true })}
          >
            Filters
          </Button>
          {props.onNew && (
            <Button size="small" onClick={props.onNew}>
              New...
            </Button>
          )}
          {props.onExport && (
            <Button size="small" onClick={props.onExport}>
              Export...
            </Button>
          )}
          {props.onDelete && (
            <Button
              size="small"
              onClick={() => (props.onDelete as (ids: string[]) => any)(Object.keys(state.selected))}
            >
              Delete...
            </Button>
          )}
        </div>
        {lastResult && (
          <div>
            <span
              style={{
                lineHeight: '28px',
                padding: '2px 6px',
                fontSize: '12px',
              }}
            >
              {getStart(search, lastResult.total as number)}-{getEnd(search, lastResult.total as number)} of{' '}
              {lastResult.total}
            </span>
            <Button testid="prev-page-button" size="small" onClick={() => emitSearchChange(movePage(search, -1))}>
              &lt;&lt;
            </Button>
            <Button testid="next-page-button" size="small" onClick={() => emitSearchChange(movePage(search, 1))}>
              &gt;&gt;
            </Button>
          </div>
        )}
      </TitleBar>
      <table>
        <thead>
          <tr>
            {checkboxColumn && (
              <th className="medplum-search-icon-cell">
                <input
                  type="checkbox"
                  value="checked"
                  aria-label="all-checkbox"
                  data-testid="all-checkbox"
                  checked={isAllSelected()}
                  onChange={(e) => handleAllCheckboxClick(e)}
                />
              </th>
            )}
            {fields.map((field) => (
              <th key={field} onClick={(e) => handleSortClick(e, field)}>
                {buildFieldNameString(schema, resourceType, field)}
              </th>
            ))}
          </tr>
          <tr>
            {checkboxColumn && <th className="filters medplum-search-icon-cell" />}
            {fields.map((field) => (
              <th key={field} className="filters">
                <FilterDescription resourceType={resourceType} field={field} filters={props.search.filters} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {resources?.map(
            (resource) =>
              resource && (
                <tr
                  key={resource.id}
                  data-testid="search-control-row"
                  onClick={(e) => handleRowClick(e, resource)}
                  onAuxClick={(e) => handleRowClick(e, resource)}
                >
                  {checkboxColumn && (
                    <td className="medplum-search-icon-cell">
                      <input
                        type="checkbox"
                        value="checked"
                        data-testid="row-checkbox"
                        aria-label={resource.id}
                        checked={!!state.selected[resource.id as string]}
                        onChange={(e) => handleSingleCheckboxClick(e, resource.id as string)}
                      />
                    </td>
                  )}
                  {fields.map((field) => (
                    <td key={field}>{renderValue(schema, resource, field)}</td>
                  ))}
                </tr>
              )
          )}
        </tbody>
      </table>
      {resources?.length === 0 && (
        <div data-testid="empty-search" className="medplum-empty-search">
          No results
        </div>
      )}
      {outcome && (
        <div data-testid="search-error" className="medplum-empty-search">
          <pre style={{ textAlign: 'left' }}>{JSON.stringify(outcome, undefined, 2)}</pre>
        </div>
      )}
      <SearchPopupMenu
        schema={schema}
        search={props.search}
        visible={state.popupVisible}
        x={state.popupX}
        y={state.popupY}
        property={state.popupField}
        onChange={(result) => {
          emitSearchChange(result);
          setState({
            ...stateRef.current,
            popupVisible: false,
            popupField: '',
          });
        }}
        onClose={() => {
          setState({
            ...stateRef.current,
            popupVisible: false,
            popupField: '',
          });
        }}
      />
      <SearchFieldEditor
        schema={schema}
        search={props.search}
        visible={stateRef.current.fieldEditorVisible}
        onOk={(result) => {
          emitSearchChange(result);
          setState({
            ...stateRef.current,
            fieldEditorVisible: false,
          });
        }}
        onCancel={() => {
          setState({
            ...stateRef.current,
            fieldEditorVisible: false,
          });
        }}
      />
      <SearchFilterEditor
        schema={schema}
        search={props.search}
        visible={stateRef.current.filterEditorVisible}
        onOk={(result) => {
          emitSearchChange(result);
          setState({
            ...stateRef.current,
            filterEditorVisible: false,
          });
        }}
        onCancel={() => {
          setState({
            ...stateRef.current,
            filterEditorVisible: false,
          });
        }}
      />
    </div>
  );
}

export const MemoizedSearchControl = React.memo(SearchControl);

interface FilterDescriptionProps {
  readonly resourceType: string;
  readonly field: string;
  readonly filters?: Filter[];
}

function FilterDescription(props: FilterDescriptionProps): JSX.Element {
  const filters = (props.filters ?? []).filter((f) => f.code === props.field);
  if (filters.length === 0) {
    return <span>no filters</span>;
  }

  return (
    <>
      {filters.map((filter: Filter, index: number) => (
        <div key={`filter-${index}-${filters.length}`}>
          {getOpString(filter.operator)}
          &nbsp;
          <SearchFilterValueDisplay resourceType={props.resourceType} filter={filter} />
        </div>
      ))}
    </>
  );
}

function getStart(search: SearchRequest, total: number): number {
  return Math.min(total, (search.page ?? 0) * (search.count ?? 10) + 1);
}

function getEnd(search: SearchRequest, total: number): number {
  return Math.min(total, ((search.page ?? 0) + 1) * (search.count ?? 10));
}
