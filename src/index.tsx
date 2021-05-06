import * as React from 'react';
import * as CSS from 'csstype';
import { getPlacementData, SIDE_OPTIONS } from '@radix-ui/popper';
import './styles.css';

////////////////////////////////////////////////////////////////////////////////
// <Inspect />

export interface InspectProps {
  children: React.ReactElement | React.ReactElement[];
  margin?: boolean;
  padding?: boolean;
  size?: boolean;
  disabled?: boolean;
}

const SHAKE_THRESHOLD = 3000;
let lastUpdate = 0;
let lastAcceleration: DeviceMotionEventAcceleration = {
  x: 0,
  y: 0,
  z: 0,
};
let isCloke = false;

export default function Inspect({
  children,
  margin = true,
  padding = true,
  size = true,
  disabled = process.env.NODE_ENV !== 'development',
}: InspectProps) {
  const nodesAtPointerRef = React.useRef<HTMLElement[]>([]);
  const [reqUserGesture, setReqUserGesture] = React.useState<boolean>(false);

  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Alt') {
        if (margin) inspectMargin(nodesAtPointerRef.current);
        if (size) inspectSize(nodesAtPointerRef.current);
        if (padding) inspectPadding(nodesAtPointerRef.current);
      }
    }

    function onKeyUp(e: KeyboardEvent) {
      if (e.key === 'Alt') {
        uninspect();
      }
    }

    function onDevicemotion(e: DeviceMotionEvent) {
      const acceleration = e.accelerationIncludingGravity!;
      const curTime = new Date().getTime();
      if (curTime - lastUpdate > 100) {
        var diffTime = curTime - lastUpdate;
        lastUpdate = curTime;
        const { x = 0, y = 0, z = 0 } = acceleration as DeviceMotionEventAcceleration;
        const { x: lastX = 0, y: lastY = 0, z: lastZ = 0 } = lastAcceleration;
        var speed = (Math.abs(x! + y! + z! - lastX! - lastY! - lastZ!) / diffTime) * 10000;
        if (speed > SHAKE_THRESHOLD) {
          if (isCloke) {
            uninspect();
            alert('Inspx is uninspect.');
          } else {
            alert('Inspx is working.');
            if (margin) inspectMargin(nodesAtPointerRef.current);
            if (size) inspectSize(nodesAtPointerRef.current);
            if (padding) inspectPadding(nodesAtPointerRef.current);
          }
          isCloke = !isCloke;
        }
        lastAcceleration = acceleration;
      }
    }

    if (!disabled) {
      window.addEventListener('keyup', onKeyUp);
      window.addEventListener('keydown', onKeyDown);
      // Need users to be authorized manually
      if (typeof DeviceMotionEvent.requestPermission === 'function') {
        DeviceMotionEvent.requestPermission()
          .then(permissionState => {
            if (permissionState === 'granted') {
              window.addEventListener('devicemotion', onDevicemotion);
            } else {
              setReqUserGesture(true);
            }
          })
          .catch(e => {
            alert(e);
            setReqUserGesture(true);
          });
      } else {
        window.addEventListener('devicemotion', onDevicemotion);
      }
    }

    return () => {
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('devicemotion', onDevicemotion);
    };
  }, [margin, size, padding, disabled, reqUserGesture]);

  if (disabled) {
    return <React.Fragment>{children}</React.Fragment>;
  }

  return (
    <span
      onMouseOver={e => {
        e.stopPropagation();

        uninspect();

        const nodes = document.elementsFromPoint(e.clientX, e.clientY) as HTMLElement[];

        nodesAtPointerRef.current = nodes as HTMLElement[];

        if (e.altKey || isCloke) {
          if (margin) inspectMargin(nodes);
          if (size) inspectSize(nodes);
          if (padding) inspectPadding(nodes);
        }
      }}
    >
      {reqUserGesture && (
        <button
          style={{
            position: 'fixed',
            top: '50vh',
          }}
          onClick={() => {
            if (typeof DeviceMotionEvent.requestPermission === 'function') {
              DeviceMotionEvent.requestPermission().then(permissionState => {
                if (permissionState === 'granted') {
                  setReqUserGesture(false);
                } else {
                  alert("You can't use Shake to wake up Inspx because you refused authorization.");
                }
              });
            }
          }}
        >
          Need users to be authorized manually，Click here！
        </button>
      )}
      {children}
    </span>
  );
}

////////////////////////////////////////////////////////////////////////////////
// Imperative code is amazing.

function createMarkerNode(text: string, type: string, popperOptions: any) {
  const marker = document.createElement('inspx');
  marker.innerText = text;
  marker.setAttribute('type', type);

  document.body.appendChild(marker);

  const { width: popperWidth, height: popperHeight } = marker.getBoundingClientRect();

  const { popperStyles } = getPlacementData({
    popperSize: { width: popperWidth, height: popperHeight },
    sideOffset: 8,
    align: 'center',
    side: 'bottom',
    alignOffset: 0,
    collisionBoundariesRect: DOMRect.fromRect({
      width: window.innerWidth,
      height: window.innerHeight,
      x: 0,
      y: 0,
    }),
    collisionTolerance: 0,
    shouldAvoidCollisions: true,
    ...popperOptions,
  });

  Object.entries(popperStyles).forEach(([key, value]) => {
    marker.style.setProperty(key, value);
  });
}

function createMargin(index: number, value: number, node: HTMLElement, side: 'top' | 'right' | 'bottom' | 'left') {
  const margin = document.createElement('margin');

  const { width: nodeWidth, height: nodeHeight } = node.getBoundingClientRect();

  const widths = [nodeWidth, value, nodeWidth, value];
  const heights = [value, nodeHeight, value, nodeHeight];

  const width = widths[index];
  const height = heights[index];

  style(margin, {
    width,
    height,
  });

  const { popperStyles } = getPlacementData({
    popperSize: { width, height },
    sideOffset: 0,
    align: 'start',
    side: side,
    alignOffset: 0,
    collisionBoundariesRect: DOMRect.fromRect({
      width: window.innerWidth,
      height: window.innerHeight,
      x: 0,
      y: 0,
    }),
    anchorRect: node.getBoundingClientRect(),
    collisionTolerance: 0,
    shouldAvoidCollisions: false,
  });

  style(margin, popperStyles as any);
  document.body.appendChild(margin);
}

function inspectMargin(nodes: HTMLElement[]) {
  const marginNodes = nodes.filter(hasMargin);

  const node = marginNodes[0];

  if (!node) {
    return;
  }

  node.setAttribute('data-inspx-active', '');

  const { marginTop, marginRight, marginBottom, marginLeft } = window.getComputedStyle(node);

  const margins = [marginTop, marginRight, marginBottom, marginLeft].map(m => parseInt(m, 10));

  margins.forEach((margin, index) => {
    if (!margin) {
      return;
    }

    createMarkerNode(String(margin), 'margin', {
      anchorRect: node.getBoundingClientRect(),
      side: SIDE_OPTIONS[index],
      shouldAvoidCollisions: false,
      sideOffset: margin / 2 - 10,
    });

    createMargin(index, margin, node, SIDE_OPTIONS[index]);
  });
}

function inspectSize(nodes: HTMLElement[]) {
  const sizeNodes = nodes.filter(hasSize);

  const node = sizeNodes[0];

  if (!node) {
    return;
  }

  node.setAttribute('data-inspx-active', '');

  const { width, height, top, left, right, bottom } = node.getBoundingClientRect();

  const marker = document.createElement('inspx');
  marker.innerText = `${Math.round(width)} x ${Math.round(height)}`;
  marker.setAttribute('type', 'size');

  document.body.appendChild(marker);

  const { width: markerWidth, height: markerHeight } = marker.getBoundingClientRect();

  const x = (left + right) / 2 - markerWidth / 2;
  const y = (top + bottom) / 2 - markerHeight / 2;

  style(marker, getPlacementStylesForPoint({ x, y }));
}

function createPadding(node: HTMLElement, paddings: number[]) {
  const padding = document.createElement('padding');

  const { width, height, x, y } = node.getBoundingClientRect();

  style(padding, {
    ...getPlacementStylesForPoint({ x, y }),
    width: width,
    height: height,
    'border-top-width': paddings[0],
    'border-right-width': paddings[1],
    'border-bottom-width': paddings[2],
    'border-left-width': paddings[3],
  });

  document.body.appendChild(padding);
}

function inspectPadding(nodes: HTMLElement[]) {
  const marginNodes = nodes.filter(hasPadding);

  const node = marginNodes[0];

  if (!node) {
    return;
  }

  node.setAttribute('data-inspx-active', '');

  const { paddingTop, paddingRight, paddingBottom, paddingLeft } = window.getComputedStyle(node);

  const paddings = [paddingTop, paddingRight, paddingBottom, paddingLeft].map(m => parseInt(m, 10));

  paddings.forEach((padding, index) => {
    if (!padding) {
      return;
    }

    createMarkerNode(String(padding), 'padding', {
      anchorRect: node.getBoundingClientRect(),
      side: SIDE_OPTIONS[index],
      shouldAvoidCollisions: false,
      sideOffset: -padding / 2 - 10,
    });
  });

  createPadding(node, paddings);
}

////////////////////////////////////////////////////////////////////////////////
// Helpers.

function uninspect() {
  Array.from(document.querySelectorAll('[data-inspx-active]')).forEach(node => {
    node.removeAttribute('data-inspx-active');
  });
  Array.from(document.querySelectorAll('inspx')).forEach(marker => {
    document.body.removeChild(marker);
  });
  Array.from(document.querySelectorAll('margin')).forEach(marker => {
    document.body.removeChild(marker);
  });
  Array.from(document.querySelectorAll('padding')).forEach(marker => {
    document.body.removeChild(marker);
  });
}

function isDefined(margin: string) {
  return !!parseInt(margin, 10);
}

function hasMargin(node: HTMLElement) {
  const styles = window.getComputedStyle(node);

  return (
    isDefined(styles.marginTop) ||
    isDefined(styles.marginRight) ||
    isDefined(styles.marginBottom) ||
    isDefined(styles.marginLeft) ||
    isDefined(styles.margin)
  );
}

function hasPadding(node: HTMLElement) {
  const styles = window.getComputedStyle(node);

  return (
    isDefined(styles.paddingTop) ||
    isDefined(styles.paddingRight) ||
    isDefined(styles.paddingBottom) ||
    isDefined(styles.paddingLeft) ||
    isDefined(styles.padding)
  );
}

function hasSize(node: HTMLElement) {
  const styles = window.getComputedStyle(node);
  return isDefined(styles.width) && isDefined(styles.height);
}

function style(node: HTMLElement, styles: Object) {
  Object.entries(styles).forEach(([key, value]) => {
    node.style.setProperty(key, typeof value === 'number' ? value + 'px' : value);
  });
}

function getPlacementStylesForPoint(point: { x: number; y: number }): CSS.Properties {
  const x = Math.round(point.x + window.scrollX);
  const y = Math.round(point.y + window.scrollY);
  return {
    position: 'absolute',
    top: 0,
    left: 0,
    minWidth: 'max-content',
    willChange: 'transform',
    transform: `translate3d(${x}px, ${y}px, 0)`,
  };
}
