import { useCallback, useState } from "react";

const useInput = (initialValue: string | number) => {
  const [value, setValue] = useState(initialValue);
  const handler = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  }, []);
  return [value, handler, setValue] as const;
};

export default useInput;
