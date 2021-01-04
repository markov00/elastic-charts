function getParams() {
  return (new URL(window.location.toString())).searchParams;
}

export function boolean(name: string, dftValue: boolean) {
  let params = getParams();
  const key = `knob-${name}`;
  if(params.has(key)) {
    return params.get(key) === 'true'
  }
  return dftValue;
}

export function number(name: string, dftValue: number) {
  let params = getParams();
  const key = `knob-${name}`;
  return Number.parseFloat(params.get(key) ?? `${dftValue}`);
}

export function color(name: string, dftValue: string) {
  return text(name, dftValue);
}

export function select(name: string, b: unknown, dftValue: string) {
  return text(name, dftValue);
}

export function text(name: string, dftValue: string) {
  let params = getParams();
  const key = `knob-${name}`;
  if(params.has(key)) {
    return params.get(key);
  }
  return dftValue;
}

export function array(name: string, dftValues: unknown[]) {
  let params = getParams();
  const values = [];
  // @ts-ignore
  for (let [key, value] of params) {
    if(key.startsWith(`knob-${name}[`)) {
      values.push(value);
    }
  }
  if(values.length === 0) {
    return dftValues;
  }
  return values;
}
