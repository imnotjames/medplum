import { createReference, getReferenceString, IndexedStructureDefinition, ProfileResource } from '@medplum/core';
import {
  ElementDefinition,
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireItemAnswerOption,
  QuestionnaireResponse,
  QuestionnaireResponseItem,
  Reference,
} from '@medplum/fhirtypes';
import React, { useEffect, useState } from 'react';
import { AttachmentInput } from './AttachmentInput';
import { Button } from './Button';
import { Form } from './Form';
import { FormSection } from './FormSection';
import { Input } from './Input';
import { useMedplum } from './MedplumProvider';
import { QuantityInput } from './QuantityInput';
import './QuestionnaireForm.css';
import { QuestionnaireItemType } from './QuestionnaireUtils';
import { ReferenceInput } from './ReferenceInput';
import { getValueAndType, ResourcePropertyDisplay } from './ResourcePropertyDisplay';
import { TextArea } from './TextArea';
import { useResource } from './useResource';

export interface QuestionnaireFormProps {
  questionnaire: Questionnaire | Reference<Questionnaire>;
  subject?: Reference;
  onSubmit: (response: QuestionnaireResponse) => void;
}

export function QuestionnaireForm(props: QuestionnaireFormProps): JSX.Element | null {
  const medplum = useMedplum();
  const source = medplum.getProfile();
  const [schema, setSchema] = useState<IndexedStructureDefinition | undefined>();
  const questionnaire = useResource(props.questionnaire);

  useEffect(() => {
    medplum.requestSchema('Questionnaire').then(setSchema);
  }, []);

  if (!schema || !questionnaire) {
    return null;
  }

  return (
    <Form
      testid="questionnaire-form"
      onSubmit={(formData: Record<string, string>) => {
        const items: QuestionnaireResponseItem[] = Object.entries(formData).map(([linkId, value]) => ({
          linkId,
          answer: [
            {
              valueString: value,
            },
          ],
        }));

        const response: QuestionnaireResponse = {
          resourceType: 'QuestionnaireResponse',
          questionnaire: getReferenceString(questionnaire),
          subject: props.subject,
          source: createReference(source as ProfileResource),
          authored: new Date().toISOString(),
          item: items,
        };

        if (props.onSubmit) {
          props.onSubmit(response);
        }
      }}
    >
      {questionnaire.title && <h1>{questionnaire.title}</h1>}
      {questionnaire.item && <QuestionnaireFormItemArray schema={schema} items={questionnaire.item} />}
      <Button type="submit" size="large">
        OK
      </Button>
    </Form>
  );
}

interface QuestionnaireFormItemArrayProps {
  schema: IndexedStructureDefinition;
  items: QuestionnaireItem[];
}

function QuestionnaireFormItemArray(props: QuestionnaireFormItemArrayProps): JSX.Element {
  return (
    <>
      {props.items.map((item) =>
        item.type === QuestionnaireItemType.group ? (
          <QuestionnaireFormItem key={item.linkId} schema={props.schema} item={item} />
        ) : (
          <FormSection key={item.linkId} htmlFor={item.linkId} title={item.text || ''}>
            <QuestionnaireFormItem schema={props.schema} item={item} />
          </FormSection>
        )
      )}
    </>
  );
}

export interface QuestionnaireFormItemProps {
  schema: IndexedStructureDefinition;
  item: QuestionnaireItem;
}

export function QuestionnaireFormItem(props: QuestionnaireFormItemProps): JSX.Element | null {
  const item = props.item;

  const type = item.type as QuestionnaireItemType;
  if (!type) {
    return null;
  }

  const name = item.linkId;
  if (!name) {
    return null;
  }

  const initial = item.initial && item.initial.length > 0 ? item.initial[0] : undefined;

  const property: ElementDefinition = {} as ElementDefinition;

  switch (type) {
    case QuestionnaireItemType.group:
      return (
        <div>
          <h3>{item.text}</h3>
          {item.item && <QuestionnaireFormItemArray schema={props.schema} items={item.item} />}
        </div>
      );
    case QuestionnaireItemType.boolean:
      return <input type="checkbox" id={name} name={name} value="true" defaultChecked={initial?.valueBoolean} />;
    case QuestionnaireItemType.decimal:
      return <Input type="number" step={0.01} name={name} defaultValue={initial?.valueDecimal} />;
    case QuestionnaireItemType.integer:
      return <Input type="number" step={1} name={name} defaultValue={initial?.valueInteger} />;
    case QuestionnaireItemType.date:
      return <Input type="date" name={name} defaultValue={initial?.valueDate} />;
    case QuestionnaireItemType.dateTime:
      return <Input type="datetime-local" name={name} step={1} defaultValue={initial?.valueDateTime} />;
    case QuestionnaireItemType.time:
      return <Input type="time" name={name} defaultValue={initial?.valueTime} />;
    case QuestionnaireItemType.string:
      return <Input type="text" name={name} defaultValue={initial?.valueString} />;
    case QuestionnaireItemType.text:
      return <TextArea name={name} defaultValue={initial?.valueString} />;
    case QuestionnaireItemType.url:
      return <Input type="url" name={name} defaultValue={initial?.valueUri} />;
    case QuestionnaireItemType.choice:
    case QuestionnaireItemType.openChoice:
      return (
        <div>
          {item.answerOption &&
            item.answerOption.map((option: QuestionnaireItemAnswerOption, index: number) => {
              const valueProperty = props.schema.types['QuestionnaireItemAnswerOption'].properties['value[x]'];
              const [propertyValue, propertyType] = getValueAndType(option, valueProperty);
              const optionName = `${name}-option-${index}`;
              return (
                <div key={optionName} className="medplum-questionnaire-option-row">
                  <div className="medplum-questionnaire-option-checkbox">
                    <input type="radio" id={optionName} name={name} value={propertyValue} />
                  </div>
                  <div>
                    <label htmlFor={optionName}>
                      <ResourcePropertyDisplay
                        schema={props.schema}
                        property={valueProperty}
                        propertyType={propertyType}
                        value={propertyValue}
                      />
                    </label>
                  </div>
                </div>
              );
            })}
        </div>
      );
    case QuestionnaireItemType.attachment:
      return <AttachmentInput name={name} defaultValue={initial?.valueAttachment} />;
    case QuestionnaireItemType.reference:
      return <ReferenceInput property={property} name={name} defaultValue={initial?.valueReference} />;
    case QuestionnaireItemType.quantity:
      return <QuantityInput name={name} defaultValue={initial?.valueQuantity} />;
  }

  return null;
}
