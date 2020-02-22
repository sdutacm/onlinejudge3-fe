import memoizeOne from 'memoize-one';

export function memoize(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  descriptor.value = memoizeOne(target[propertyKey]);
}
