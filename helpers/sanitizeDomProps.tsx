/**
 * Filters out Combini-specific internal props from a props object.
 * This is useful for preventing React warnings about unknown props on DOM elements
 * by removing any prop that starts with the `__combini_` prefix.
 *
 * @param props - The props object to sanitize.
 * @returns A new props object containing only the valid DOM props.
 */
export function sanitizeDomProps<T extends Record<string, any>>(props: T): Partial<T> {
  const sanitizedProps = Object.fromEntries(
    Object.entries(props).filter(([key]) => !key.startsWith('__combini_'))
  );
  return sanitizedProps as Partial<T>;
}