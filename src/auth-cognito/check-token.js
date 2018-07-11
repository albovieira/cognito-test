import { sign, jwt } from 'jsonwebtoken';

const jwkToPem = require('jwk-to-pem');
const jwt_set = require('./jwt_set.json');

const SECRET = 'M4xm1l#4s';

const userPoolId =
  'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_GImsZPw5d';

const pems = {};
for (let i = 0; i < jwt_set.keys.length; i++) {
  // take the jwt_set key and create a jwk object for conversion into PEM
  const jwk = {
    kty: jwt_set.keys[i].kty,
    n: jwt_set.keys[i].n,
    e: jwt_set.keys[i].e
  };
  // convert jwk object into PEM
  const pem = jwkToPem(jwk);
  // append PEM to the pems object, with the kid as the identifier
  pems[jwt_set.keys[i].kid] = pem;
}

async function authCheck(req, res, next) {
  try {
    const jwtToken = req.headers.authorization;
    await validateCognitoToken(pems, jwtToken);
    next();
  } catch (error) {
    console.log(error);
    return res.status(403).json({ message: 'Não Autorizado' });
  }
}

async function validateCognitoToken(pems, jwtToken) {
  try {
    // PART 1: Decode the JWT token
    const decodedJWT = jwt.decode(jwtToken, { complete: true });
    // PART 2: Check if its a valid JWT token
    if (!decodedJWT) {
      console.log('Not a valid JWT token');
      throw new Error('Not a valid JWT token');
    }
    // PART 3: Check if ISS matches our userPool Id
    if (decodedJWT.payload.iss != userPoolId) {
      console.log('invalid issuer');
      throw {
        message: 'invalid issuer',
        iss: decodedJWT.payload
      };
    }
    // PART 4: Check that the jwt is an AWS 'Access Token'
    if (decodedJWT.payload.token_use != 'access') {
      console.log('Not an access token');
      throw new Error('Not an access token');
    }
    // PART 5: Match the PEM against the request KID
    const kid = decodedJWT.header.kid;
    const pem = pems[kid];
    if (!pem) {
      console.log('Invalid access token');
      throw new Error('Invalid access token');
    }
    console.log('Decoding the JWT with PEM!');

    const payload = await jwt.verify(jwtToken, pem, { issuer: userPoolId });
    console.log(payload);
    return payload;
    // PART 6: Verify the signature of the JWT token to ensure its really coming from your User Pool
    /* jwt.verify(jwtToken, pem, { issuer: userPool_Id }, function(err, payload) {
      if (err) {
        console.log('Unauthorized signature for this JWT Token');
        throw new Error('Unauthorized signature for this JWT Token');
      } else {
        // if payload exists, then the token is verified!
        res(payload);
      }
    }) */
  } catch (error) {
    throw error;
  }
}

async function generateToken(user) {
  const token = await sign(
    {
      // exp: 31536000,
      expiresIn: '30d',
      algorithm: 'HS256',
      ...user
    },
    SECRET
  );

  return token;
}

export { authCheck };
