import { IndexedStructureDefinition, SearchRequest, stringify } from '@medplum/core';
import React, { useEffect, useRef, useState } from 'react';
import { Button } from './Button';
import { Dialog } from './Dialog';
import { buildFieldNameString } from './SearchUtils';

interface SearchFieldEditorProps {
  schema: IndexedStructureDefinition;
  visible: boolean;
  search: SearchRequest;
  onOk: (search: SearchRequest) => void;
  onCancel: () => void;
}

export function SearchFieldEditor(props: SearchFieldEditorProps): JSX.Element | null {
  const [state, setState] = useState({
    search: JSON.parse(stringify(props.search)) as SearchRequest,
  });

  const availableRef = useRef<HTMLSelectElement>(null);
  const selectedRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    setState({ search: props.search });
  }, [props.search]);

  /**
   * Handles a key down event on the "available" field.
   * If the user presses enter, it is a shortcut for the "Add" button.
   *
   * @param {KeyboardEvent} e The keyboard event.
   */
  function handleAvailableKeyDown(e: React.KeyboardEvent): void {
    if (e.key === 'Enter') {
      onAddField();
    }
  }

  /**
   * Handles a double click on the "available" field.
   * If the user double clicks an entry, it is a shortcut for the "Add" button.
   */
  function handleAvailableDoubleClick(): void {
    onAddField();
  }

  /**
   * Handles a key down event on the "available" field.
   * If the user presses enter, it is a shortcut for the "Add" button.
   *
   * @param {KeyboardEvent} e The keyboard event.
   */
  function handleSelectedKeyDown(e: React.KeyboardEvent): void {
    if (e.key === 'Enter') {
      onRemoveField();
    }
  }

  /**
   * Handles a double click on the "available" field.
   * If the user double clicks an entry, it is a shortcut for the "Add" button.
   */
  function handleSelectedDoubleClick(): void {
    onRemoveField();
  }

  /**
   * Handles a click on the "Add" button.
   * Moves the "available" selection into the "selected" list.
   */
  function onAddField(): void {
    const currentField = state.search.fields ?? [];
    const key = availableRef.current?.value;
    if (key) {
      const newFields = [...currentField, key];
      setState({
        search: {
          ...state.search,
          fields: newFields,
        },
      });
    }
  }

  /**
   * Handles a click on the "Remove" button.
   * Moves the "selected" selection into the "available" list.
   */
  function onRemoveField(): void {
    const currentField = state.search.fields ?? [];
    const key = selectedRef.current?.value;
    if (key) {
      const newFields = [...currentField];
      newFields.splice(newFields.indexOf(key), 1);
      setState({
        search: {
          ...state.search,
          fields: newFields,
        },
      });
    }
  }

  /**
   * Handles a click on the "Up" button.
   * Moves the selection up one position in the list.
   */
  function onMoveUp(): void {
    const currentField = state.search.fields ?? [];
    const field = selectedRef.current?.value;
    if (field) {
      const newFields = [...currentField];
      const index = newFields.indexOf(field);
      swapFields(newFields, index, index - 1);

      setState({
        search: {
          ...state.search,
          fields: newFields,
        },
      });
    }
  }

  /**
   * Handles a click on the "Down" button.
   * Moves the selection down one position in the list.
   */
  function onMoveDown(): void {
    const currentField = state.search.fields ?? [];
    const field = selectedRef.current?.value;
    if (field) {
      const newFields = [...currentField];
      const index = newFields.indexOf(field);
      swapFields(newFields, index, index + 1);

      setState({
        search: {
          ...state.search,
          fields: newFields,
        },
      });
    }
  }

  /**
   * Swaps two fields in the search.
   *
   * @param {number} i The index of the first field.
   * @param {number} j The index of the second field.
   */
  function swapFields(fields: string[], i: number, j: number): void {
    const temp = fields[i];
    fields[i] = fields[j];
    fields[j] = temp;
  }

  if (!props.visible) {
    return null;
  }

  const resourceType = props.search.resourceType;
  const typeDef = props.schema.types[resourceType];

  const selected = state.search.fields ?? [];
  const available = Object.keys(typeDef.properties)
    .filter((field) => !selected?.includes(field))
    .sort();

  return (
    <Dialog title="Fields" visible={props.visible} onOk={() => props.onOk(state.search)} onCancel={props.onCancel}>
      <div>
        <table style={{ margin: 'auto' }}>
          <thead>
            <tr>
              <th colSpan={2} align="center">
                Available
              </th>
              <th colSpan={2} align="center">
                Selected
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={2} align="center">
                <select
                  ref={availableRef}
                  size={15}
                  tabIndex={1}
                  style={{ width: '200px' }}
                  onKeyDown={(e) => handleAvailableKeyDown(e)}
                  onDoubleClick={() => handleAvailableDoubleClick()}
                  data-testid="available"
                >
                  {available.map((key) => (
                    <option key={key} value={key}>
                      {buildFieldNameString(props.schema, resourceType, key)}
                    </option>
                  ))}
                </select>
              </td>
              <td colSpan={2} align="center">
                <select
                  ref={selectedRef}
                  size={15}
                  tabIndex={4}
                  style={{ width: '200px' }}
                  onKeyDown={(e) => handleSelectedKeyDown(e)}
                  onDoubleClick={() => handleSelectedDoubleClick()}
                  data-testid="selected"
                >
                  {selected.map((key) => (
                    <option key={key} value={key}>
                      {buildFieldNameString(props.schema, resourceType, key)}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td align="center">
                <Button size="small" onClick={onAddField}>
                  Add
                </Button>
              </td>
              <td align="center">
                <Button size="small" onClick={onRemoveField}>
                  Remove
                </Button>
              </td>
              <td align="center">
                <Button size="small" onClick={onMoveUp}>
                  Up
                </Button>
              </td>
              <td align="center">
                <Button size="small" onClick={onMoveDown}>
                  Down
                </Button>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </Dialog>
  );
}
