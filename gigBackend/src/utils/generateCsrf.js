import Tokens from "csrf";

const tokens = new Tokens();

export const generateCSRFToken = (secret) => {
  return tokens.create(secret);
};

export const verifyCSRFToken = (secret, token) => {
  return tokens.verify(secret, token);
};