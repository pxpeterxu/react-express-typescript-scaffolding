/**
 * Echoes back the string that we were given.
 */
export async function getEcho(echo: string) {
  return {
    success: true,
    data: echo,
  };
}
