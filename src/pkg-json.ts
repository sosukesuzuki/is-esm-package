import { useMemo } from "preact/hooks";
import { useQuery, UseQueryResult } from "react-query";

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
export function usePkgType(pkgJsonResult: UseQueryResult): PkgType {
  const pkgType = useMemo(() => {
    return getTypeFromPkgJson(pkgJsonResult.data);
  }, [pkgJsonResult]);
  return pkgType;
}

function hasExports(pkgJson: unknown): pkgJson is { exports: object } {
  if (!Object.prototype.hasOwnProperty.call(pkgJson, "exports")) {
    return false;
  }
  return (
    // @ts-ignore
    (typeof pkgJson.exports === "object" &&
      // @ts-ignore
      pkgJson.exports !== null) ||
    // @ts-ignore
    typeof pkgJson.exports === "string"
  );
}
function getPkgExports(pkgJson: unknown): string | undefined {
  if (typeof pkgJson === "object" && pkgJson !== null && hasExports(pkgJson)) {
    return JSON.stringify({ exports: pkgJson.exports }, null, 2);
  }
}
export function usePkgExports(
  pkgJsonResult: UseQueryResult
): string | undefined {
  const pkgExports = useMemo(() => {
    if (
      // @ts-ignore
      pkgJsonResult.data?.exports
    ) {
      // @ts-ignore
      return JSON.stringify({ exports: pkgJsonResult.data.exports }, null, 2);
    }
  }, [pkgJsonResult]);
  return pkgExports;
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
export function usePkgJson(packageName: string) {
  const unpkgUrl = useMemo(() => getUnpkgUrl(packageName), [packageName]);
  const pkgJsonResult = useQuery(
    packageName,
    async () => {
      if (packageName === "") {
        throw new Error("No package name");
      }
      const res = await fetch(unpkgUrl);
      if (!res.ok) {
        if (res.status === 404) {
          throw new NotFoundError();
        }
        throw res;
      }
      const responsJson = await res.json();
      return responsJson;
    },
    {
      retry: false,
    }
  );
  return pkgJsonResult;
}
