const createAccount = `
INSERT INTO users (
    id,
    username,
    emailid,
    name,
    password,
    profile_image,
    bio,
    location,
    website,
    mode
) 
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);
`;

const getUserName = `
SELECT id 
FROM 
  users 
WHERE 
  username = $1 OR emailid = $2;
`;

module.exports = {
  createAccount,
  getUserName,
};
