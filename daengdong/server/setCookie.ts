const getSetCookieValues = (headers: Headers): string[] => {
  const headersWithGetSetCookie = headers as Headers & {
    getSetCookie?: () => string[];
  };

  if (typeof headersWithGetSetCookie.getSetCookie === "function") {
    return headersWithGetSetCookie.getSetCookie();
  }

  const combined = headers.get("set-cookie");
  return combined ? [combined] : [];
};

export const appendSetCookies = (target: Headers, source: Headers): void => {
  const setCookies = getSetCookieValues(source);
  setCookies.forEach((cookie) => {
    target.append("set-cookie", cookie);
  });
};
