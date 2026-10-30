import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import Inspect, { InspectProps } from '../src';

jest.mock('../src/styles.css', () => ({}));

let container: HTMLDivElement;
let nodesAtPointer: HTMLElement[];
const originalElementsFromPoint = document.elementsFromPoint;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  nodesAtPointer = [];
  document.elementsFromPoint = jest.fn(() => nodesAtPointer);
});

afterEach(() => {
  act(() => {
    ReactDOM.unmountComponentAtNode(container);
  });
  document.body.innerHTML = '';
  document.elementsFromPoint = originalElementsFromPoint;
});

function renderInspect(props: Partial<InspectProps> = {}) {
  act(() => {
    ReactDOM.render(
      <Inspect disabled={false} margin={false} padding={false} {...props}>
        <div id="first" style={{ width: 100, height: 50 }} />
        <div id="second" style={{ width: 200, height: 75 }} />
      </Inspect>,
      container
    );
  });
  return Array.from(container.querySelectorAll('div'));
}

function hover(node: HTMLElement, modifiers: MouseEventInit = {}) {
  nodesAtPointer = [node];
  act(() => {
    node.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, ...modifiers }));
  });
}

function key(type: 'keydown' | 'keyup', value: string) {
  act(() => {
    window.dispatchEvent(new KeyboardEvent(type, { key: value }));
  });
}

function expectInspection(node: HTMLElement | null) {
  expect(Array.from(document.querySelectorAll('[data-inspx-active]'))).toEqual(node ? [node] : []);
  expect(document.querySelectorAll('inspx[type="size"]')).toHaveLength(node ? 1 : 0);
}

describe.each([
  ['default Alt', undefined, 'Alt', 'Control'],
  ['explicit Alt', 'Alt', 'Alt', 'Control'],
  ['Control', 'Control', 'Control', 'Alt'],
] as const)('%s modifier', (_label, modifierKey, activeKey, otherKey) => {
  const props = modifierKey === undefined ? {} : { modifierKey };
  const modifiers = activeKey === 'Alt' ? { altKey: true } : { ctrlKey: true };
  const otherModifiers = activeKey === 'Alt' ? { ctrlKey: true } : { altKey: true };

  it('activates on keydown and dismisses only on the configured keyup', () => {
    const [node] = renderInspect(props);
    hover(node);
    expectInspection(null);

    key('keydown', otherKey);
    expectInspection(null);

    key('keydown', activeKey);
    expectInspection(node);

    key('keyup', otherKey);
    expectInspection(node);

    key('keyup', activeKey);
    expectInspection(null);
  });

  it('inspects the hovered element only while the configured modifier is held', () => {
    const [first, second] = renderInspect(props);
    hover(first, otherModifiers);
    expectInspection(null);

    hover(first, modifiers);
    expectInspection(first);

    hover(second, modifiers);
    expectInspection(second);

    hover(first);
    expectInspection(null);
  });

  it('dismisses hover-activated inspection when the configured modifier is released', () => {
    const [node] = renderInspect(props);
    hover(node, modifiers);
    expectInspection(node);

    key('keyup', otherKey);
    expectInspection(node);

    key('keyup', activeKey);
    expectInspection(null);
  });
});

it('updates keyboard listeners and hover activation when modifierKey changes', () => {
  const [node] = renderInspect({ modifierKey: 'Alt' });
  hover(node);

  renderInspect({ modifierKey: 'Control' });
  key('keydown', 'Alt');
  expectInspection(null);

  key('keydown', 'Control');
  expectInspection(node);

  key('keyup', 'Alt');
  expectInspection(node);

  key('keyup', 'Control');
  expectInspection(null);

  hover(node, { altKey: true });
  expectInspection(null);

  hover(node, { ctrlKey: true });
  expectInspection(node);
});
