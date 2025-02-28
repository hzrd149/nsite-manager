import { useCallback, useState } from "react";

export default function useToggleArray() {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = useCallback(
    (item: string) => {
      setSelected((arr) =>
        arr.includes(item) ? arr.filter((v) => v !== item) : [...arr, item],
      );
    },
    [setSelected],
  );

  const replace = useCallback(
    (items: string[]) => setSelected(items),
    [setSelected],
  );

  return { selected, toggle, replace };
}
