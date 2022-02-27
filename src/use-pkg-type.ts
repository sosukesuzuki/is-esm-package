import { useMemo } from "preact/hooks";
import { useQuery } from "react-query";

function getUnpkgUrl(packageName: string): string {
  return `https://www.unpkg.com/${packageName}/package.json`;
}

type PkgType = "cjs" | "module" | undefined;
function hasType(pkgJson: unknown): pkgJson is { type: PkgType } {
  return (
    Object.prototype.hasOwnProperty.call(pkgJson, "type") &&
    // @ts-ignore
    typeof pkgJson.type === "string"
  );
}
function getTypeFromPkgJson(pkgJson: unknown): PkgType {
  if (typeof pkgJson === "object" && pkgJson !== null && hasType(pkgJson)) {
    return pkgJson.type;
  }
}

class NotFoundError extends Error {
  name = "NotFoundError";
  constructor() {
    super("Not Found");
  }
}
export function isNotFoundError(error: unknown): error is NotFoundError {
  return error instanceof NotFoundError;
}
export function usePkgType(packageName: string) {
  const unpkgUrl = useMemo(() => getUnpkgUrl(packageName), [packageName]);
  const pkgTypeResult = useQuery(
    packageName,
    async () => {
      const res = await fetch(unpkgUrl);
      if (!res.ok) {
        if (res.status === 404) {
          throw new NotFoundError();
        }
        throw res;
      }
      const responsJson = await res.json();
      const pkgType = getTypeFromPkgJson(responsJson);
      return pkgType;
    },
    {
      retry: false,
    }
  );
  return pkgTypeResult;
}
