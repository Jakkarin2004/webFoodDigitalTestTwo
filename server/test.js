const bcrypt = require("bcrypt");

async function createOwner() {
  const hashedPassword = await bcrypt.hash("12345678", 10);
  console.log(hashedPassword);
}

createOwner();
