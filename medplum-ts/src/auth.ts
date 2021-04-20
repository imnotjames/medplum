import { KEYUTIL, KJUR, RSAKey } from 'jsrsasign';

// Based on:
// https://aws.amazon.com/blogs/security/how-to-add-authentication-single-page-web-application-with-amazon-cognito-oauth2-implementation/

// Uses jsrsasign:
// https://kjur.github.io/jsrsasign/
// https://github.com/kjur/jsrsasign/wiki/Tutorial-for-JWT-verification

// const CLIENT_ID = process.env['CLIENT_ID'] as string;
// const JWKS_URL = process.env['JWKS_URL'] as string;
// const AUTHORIZE_URL = process.env['AUTHORIZE_URL'] as string;
// const TOKEN_URL = process.env['TOKEN_URL'] as string;
// const SIGN_OUT_URL = process.env['SIGN_OUT_URL'] as string;

const CLIENT_ID = '0b38b44f-44bf-4803-b514-05249ecb7a81';
const JWKS_URL = 'http://host.docker.internal:5000/.well-known/jwks.json';
const AUTHORIZE_URL = 'http://host.docker.internal:5000/oauth2/authorize';
const TOKEN_URL = 'http://host.docker.internal:5000/oauth2/token';
const SIGN_OUT_URL = 'http://host.docker.internal:5000/oauth2/logout';

interface TokenResponse {
  token_type: string;
  id_token: string;
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

interface Avatar {
  imageUrl: string;
  thumbUrl: string;
}

interface User {
  id: string;
  name: string;
  avatar: Avatar;
}

class Auth {
  accessToken?: string;
  user?: User;

  constructor() {
    this.accessToken = localStorage.getItem('accessToken') || undefined;

    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        this.user = JSON.parse(userJson);
      } catch (ex) {
        this.clear();
      }
    }
  }

  /**
   * Clears all auth state including local storage and session storage.
   */
  clear(): void {
    this.accessToken = undefined;
    this.user = undefined;
    sessionStorage.clear();
    localStorage.clear();
  }

  /**
   * Returns true if the user is signed in with an access token.
   */
  isSignedIn(): boolean {
    return !!this.user && !!this.accessToken;
  }

  /**
   * Tries to sign in the user.
   * Returns true if the user is signed in.
   * This may result in navigating away to the sign in page.
   */
  signIn(): boolean {
    if (this.isSignedIn()) {
      // We have a user, nothing else to do
      return true;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (!code) {
      this.requestAuthorization();
    } else {
      this.processCode(code);
    }

    return false;
  }

  /**
   * Tries to sign out the user.
   * See: https://docs.aws.amazon.com/cognito/latest/developerguide/logout-endpoint.html
   */
  signOut() {
    this.requestAuthorization(SIGN_OUT_URL);
  }

  /**
   * Redirects the user to the login screen for authorization.
   * Clears all auth state including local storage and session storage.
   * See: https://openid.net/specs/openid-connect-core-1_0.html#AuthorizationEndpoint
   * @param baseUrl Optional base URL.  Uses authorize URL by default.
   */
  async requestAuthorization(baseUrl?: string) {
    console.log('Requesting authorization...');

    this.clear();

    const pkceState = getRandomString();
    sessionStorage.setItem('pkceState', pkceState);

    const codeVerifier = getRandomString();
    sessionStorage.setItem('codeVerifier', codeVerifier);

    const arrayHash = await encryptStringWithSHA256(codeVerifier);
    const codeChallenge = hashToBase64url(arrayHash);
    sessionStorage.setItem('codeChallenge', codeChallenge);

    //const scope = 'launch/patient openid fhirUser offline_access patient/Medication.read patient/AllergyIntolerance.read patient/CarePlan.read patient/CareTeam.read patient/Condition.read patient/Device.read patient/DiagnosticReport.read patient/DocumentReference.read patient/Encounter.read patient/Goal.read patient/Immunization.read patient/Location.read patient/MedicationRequest.read patient/Observation.read patient/Organization.read patient/Patient.read patient/Practitioner.read patient/Procedure.read patient/Provenance.read';
    const scope = 'launch/patient openid fhirUser offline_access user/*.*';

    window.location.href = (baseUrl || AUTHORIZE_URL) +
      '?response_type=code' +
      '&state=' + encodeURIComponent(pkceState) +
      '&client_id=' + encodeURIComponent(CLIENT_ID) +
      '&redirect_uri=' + encodeURIComponent(getBaseUrl()) +
      '&scope=' + encodeURIComponent(scope) +
      '&code_challenge_method=S256' +
      '&code_challenge=' + encodeURIComponent(codeChallenge);
  }

  /**
   * Processes an OAuth authorization code.
   * See: https://openid.net/specs/openid-connect-core-1_0.html#TokenRequest
   * @param code The authorization code received by URL parameter.
   */
  private async processCode(code: string) {
    console.log('Processing authorization code...');

    const pkceState = sessionStorage.getItem('pkceState');
    if (!pkceState) {
      this.clear();
      throw new Error('Invalid PCKE state');
    }

    const codeVerifier = sessionStorage.getItem('codeVerifier');
    if (!codeVerifier) {
      this.clear();
      throw new Error('Invalid PCKE code verifier');
    }

    await this.fetchTokens(
      'grant_type=authorization_code' +
      '&client_id=' + encodeURIComponent(CLIENT_ID) +
      '&code_verifier=' + encodeURIComponent(codeVerifier) +
      '&redirect_uri=' + encodeURIComponent(getBaseUrl()) +
      '&code=' + encodeURIComponent(code));
  }

  /**
   * Tries to refresh the auth tokens.
   * See: https://openid.net/specs/openid-connect-core-1_0.html#RefreshTokens
   */
  async refresh() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      this.clear();
      throw new Error('Invalid refresh token');
    }

    await this.fetchTokens(
      'grant_type=refresh_token' +
      '&client_id=' + encodeURIComponent(CLIENT_ID) +
      '&refresh_token=' + encodeURIComponent(refreshToken));
  }

  /**
   * Makes a POST request to the tokens endpoint.
   * See: https://openid.net/specs/openid-connect-core-1_0.html#TokenEndpoint
   * @param formBody Token parameters in URL encoded format.
   */
  private async fetchTokens(formBody: string) {
    return fetch(
      TOKEN_URL,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formBody
      })
      .then(response => response.json())
      .then(tokens => this.verifyTokens(tokens));
  }

  /**
   * Verifies the tokens received from the auth server.
   * Validates the JWT against the JWKS.
   * See: https://openid.net/specs/openid-connect-core-1_0.html#TokenEndpoint
   * @param tokens
   */
  private async verifyTokens(tokens: TokenResponse) {
    console.log('Verifying authorization token...');

    const token = tokens.access_token;

    // Get Cognito keys
    const keys = await fetch(JWKS_URL)
      .then(response => response.json())
      .then(data => data['keys']);

    // Get the kid (key id)
    const tokenHeader = parseJWTHeader(token);
    const keyId = tokenHeader.kid;

    // Search for the kid key id in the Cognito Keys
    const key = keys.find((key: any) => key.kid === keyId)
    if (key === undefined) {
      this.clear();
      throw new Error('Public key not found in jwks.json');
    }

    // Verify JWT Signature
    const keyObj = KEYUTIL.getKey(key);
    const isValid = KJUR.jws.JWS.verifyJWT(
      token,
      keyObj as RSAKey,
      {
        alg: ['RS256'],
        gracePeriod: 3600
      });
    if (!isValid) {
      this.clear();
      throw new Error('Signature verification failed');
    }

    // Verify token has not expired
    const tokenPayload = parseJWTPayload(token);
    if (Date.now() >= tokenPayload.exp * 1000) {
      this.clear();
      throw new Error('Token expired');
    }

    // Verify app_client_id
    if (tokenPayload.client_id !== CLIENT_ID) {
      this.clear();
      throw new Error('Token was not issued for this audience');
    }

    this.accessToken = token;

    const expireTime = new Date();
    expireTime.setSeconds(expireTime.getSeconds() + tokens.expires_in);

    localStorage.setItem('accessToken', token);
    localStorage.setItem('refreshToken', tokens.refresh_token);
    localStorage.setItem('expireTime', expireTime.toISOString());

    this.fetchUser();
  }

  /**
   * Fetches the user data from the API server.
   */
  private fetchUser() {
    console.log('Requesting user details...');
    // FhirClient.fetch('GET', 'users/me')
    //   .then(user => {
    //     localStorage.setItem('user', JSON.stringify(user));
    //     window.location.href = '/';
    //   });
    localStorage.setItem('user', JSON.stringify({}));
    window.location.href = '/';
  }
}

/**
 * Returns the base URL for the current page.
 */
function getBaseUrl() {
  return window.location.protocol + '//' + window.location.host + '/';
}

/**
 * Decodes a section of a JWT.
 * See: https://tools.ietf.org/html/rfc7519
 * @param payload
 */
function decodePayload(payload: string) {
  const cleanedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
  const decodedPayload = atob(cleanedPayload)
  const uriEncodedPayload = Array.from(decodedPayload).reduce((acc, char) => {
    const uriEncodedChar = ('00' + char.charCodeAt(0).toString(16)).slice(-2)
    return `${acc}%${uriEncodedChar}`
  }, '')
  const jsonPayload = decodeURIComponent(uriEncodedPayload);
  return JSON.parse(jsonPayload)
}

/**
 * Parses the JWT payload.
 * @param token JWT token
 */
function parseJWTPayload(token: string) {
  const [header, payload, signature] = token.split('.');
  const jsonPayload = decodePayload(payload);
  return jsonPayload;
}

/**
 * Parses the JWT header.
 * @param token JWT token
 */
function parseJWTHeader(token: string) {
  const [header, payload, signature] = token.split('.');
  const jsonHeader = decodePayload(header);
  return jsonHeader;
}

/**
 * Returns a cryptographically secure random string.
 */
function getRandomString() {
  const randomItems = new Uint32Array(28);
  crypto.getRandomValues(randomItems);
  const binaryStringItems = Array.from(randomItems).map(dec => `0${dec.toString(16).substr(-2)}`);
  return binaryStringItems.reduce((acc, item) => `${acc}${item}`, '');
}

/**
 * Encrypts a string with SHA256 encryption.
 * @param str
 */
async function encryptStringWithSHA256(str: string) {
  const PROTOCOL = 'SHA-256'
  const textEncoder = new TextEncoder();
  const encodedData = textEncoder.encode(str);
  return crypto.subtle.digest(PROTOCOL, encodedData);
}

/**
 * Returns a base-64 URL from the array buffer.
 * @param arrayBuffer
 */
function hashToBase64url(arrayBuffer: ArrayBuffer) {
  const items = new Uint8Array(arrayBuffer)
  const stringifiedArrayHash = items.reduce((acc, i) => `${acc}${String.fromCharCode(i)}`, '')
  const decodedHash = btoa(stringifiedArrayHash)
  const base64URL = decodedHash.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return base64URL
}

/**
 * The auth singleton.
 */
export const auth = new Auth();
