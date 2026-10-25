// The access token lives only in memory, so an XSS script can't read it from storage.
let accessToken: string | null = null;

export const getAccessToken = () => accessToken;
export const setAccessToken = (t: string | null) => {
  accessToken = t;
};